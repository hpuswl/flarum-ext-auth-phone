<?php
namespace Hpuswl\AuthPhone\Common;

use Hpuswl\AuthPhone\KeyDisk;
use Hpuswl\AuthPhone\PhoneCode;

class GenerateCode
{

    public function generate($uid, $phone, $second, $ip){
        if(!$second || $second==0){
            $second = 300;
        }
        $randNumber = (string) mt_rand(100000,999999);
        $randNumber = str_shuffle($randNumber);
        $phone = trim($phone);
        $disk = resolve(KeyDisk::class);
        $diskInfo = $disk->get();
        $encryptPhone = (new Aes($diskInfo["key"],$diskInfo["iv"]))->Encrypt($phone);
        $where = [
            ["phone", "=", $encryptPhone],
            ["exp_time", ">=", time()]
        ];
        if ($uid && $uid > 0) {
            $where[] = ["user_id", "=", $uid];
        }
        $info = PhoneCode::where($where)->orderBy("created_time","desc")->first();

        if($info){
            return array((int)$info->exp_time, true);
        }

        return array($randNumber,false);
    }

    public function save($uid, $phone, $code, $second, $ip) {
        if(!$second || $second==0){
            $second = 300;
        }
        $phone = trim($phone);
        $disk = resolve(KeyDisk::class);
        $diskInfo = $disk->get();
        $encryptPhone = (new Aes($diskInfo["key"],$diskInfo["iv"]))->Encrypt($phone);

        PhoneCode::insert([
            "user_id" => $uid,
            "phone" => $encryptPhone,
            "code" => $code,
            "ip" => $ip,
            "exp_time" => time() + $second,
            "created_time" => time()
        ]);
    }

    
}
