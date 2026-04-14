<?php

namespace Hpuswl\AuthPhone\Listener;

use Hpuswl\AuthPhone\Common\Aes;
use Flarum\User\Event\Saving;
use Illuminate\Support\Arr;
use Flarum\Foundation\ValidationException;
use Hpuswl\AuthPhone\Common\AliSMS;
use Illuminate\Contracts\Cache\Repository;
use Hpuswl\AuthPhone\PhoneHistory;
use Hpuswl\AuthPhone\KeyDisk;
use Hpuswl\AuthPhone\PhoneCode;
use Symfony\Contracts\Translation\TranslatorInterface;

class SavePhone
{
    public function handle(Saving $event)
    {
        $user = $event->user;
        $data = $event->data;
        $actor = $event->actor;
        $isSelf = $actor->id === $user->id;
        $canEdit = $actor->can('edit', $user);
        $attributes = Arr::get($data, 'attributes', []);
        if ( isset($attributes['phone']) ) {
            if ($user->exists && !$isSelf) {
                $actor->assertPermission($canEdit);
            }
            $disk = resolve(KeyDisk::class);
            $info = $disk->get();
            $phone = $attributes['phone'];
            
            if ($phone==""){
                PhoneHistory::insert([
                    "user_id" => $user->id,
                    "phone" => $user->phone,
                    "created_time" => time()
                ]);
                $user->phone = "";
                $user->phone_region = "";
                $user->save();
                return;
            }
            if(!isset($attributes['region']) || $attributes['region']==""){
                throw new ValidationException(["msg" => "region_null"]);
            }
            $translator = resolve(TranslatorInterface::class);

            if(!in_array($attributes['region'],["ChineseMainland","HongKong","Macao","Taiwan"])){
                throw new ValidationException(["msg"=>$translator->trans('hpuswl-auth-phone.forum.alerts.region_invalid')]);
            }
            $regionInfo = ["ChineseMainland" => "86", "HongKong" => "852", "Macao" => "853", "Taiwan" => "886"];
            $phone = $regionInfo[$attributes['region']] . $phone;
            $encryptPhone = (new Aes($info["key"],$info["iv"]))->Encrypt($phone);
            
            // 如果是已存在的用户，且不是管理员在编辑，则需要验证码校验逻辑
            if ($user->exists && !$actor->isAdmin()) {
                if(!isset($attributes['code']) || $attributes['code']==""){
                    throw new ValidationException(["msg" => "code_null"]);
                }

                $info = PhoneCode::where([
                    ["phone", "=", $encryptPhone],
                    ["exp_time",">=", time()]
                ])->orderBy("created_time","desc")->first();
                
                if(!$info){
                    throw new ValidationException(["msg"=>$translator->trans('hpuswl-auth-phone.forum.alerts.code_expired')]);
                }
                if($info->code!=$attributes['code']){
                    throw new ValidationException(["msg"=>$translator->trans('hpuswl-auth-phone.forum.alerts.code_invalid')]);
                }

                PhoneCode::where([
                    ["phone", "=", $encryptPhone],
                    ["code", "=", $attributes['code']],
                    ["exp_time", ">=", time()]
                ])->delete();
            }

            if ($encryptPhone !== $user->phone && AliSMS::phoneExist($phone) ){
                throw new ValidationException(["msg"=>$translator->trans('hpuswl-auth-phone.forum.alerts.phone_exist')]);
            }
            
            $user->phone = $encryptPhone;
            $user->phone_region = $regionInfo[$attributes['region']];
            
            if ($user->exists) {
                $user->save();
            }
        }
    }
}
