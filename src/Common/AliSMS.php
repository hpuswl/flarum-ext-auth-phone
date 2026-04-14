<?php

namespace Hpuswl\AuthPhone\Common;

use AlibabaCloud\SDK\Dysmsapi\V20170525\Dysmsapi;
use AlibabaCloud\SDK\Dysmsapi\V20170525\Models\SendSmsRequest;
use AlibabaCloud\Tea\Exception\TeaError;
use AlibabaCloud\Tea\Utils\Utils\RuntimeOptions;
use Darabonba\OpenApi\Models\Config;
use Exception;
use Flarum\Foundation\ValidationException;
use Flarum\Settings\SettingsRepositoryInterface;
use Hpuswl\AuthPhone\KeyDisk;
use Hpuswl\AuthPhone\Users;
use Symfony\Contracts\Translation\TranslatorInterface;

class AliSMS
{
    public static function createClient($accessKeyId, $accessKeySecret){
        $config = new Config([
            "accessKeyId" => $accessKeyId,
            "accessKeySecret" => $accessKeySecret
        ]);
        // 访问的域名
        $config->endpoint = "dysmsapi.aliyuncs.com";
        return new Dysmsapi($config);
    }

    public static function send($data, $uid, $ip){
        $msg = ["status" => false , "msg" => ""];
        $phone = isset($data["phone"]) ? $data["phone"] : 0;
        $region = isset($data["region"]) ? $data["region"] : "ChineseMainland";
        if (!$phone || !$region){
            $msg["msg"] = "param is invalid";
            return $msg;
        }
        $translator = resolve(TranslatorInterface::class);
        $settings = resolve(SettingsRepositoryInterface::class);
        $temp_code = $settings->get('hpuswl-auth-phone.api_sms_ali_template_code');

        if(!in_array($region,["ChineseMainland","HongKong","Macao","Taiwan"])){
            throw new ValidationException(["msg"=>$translator->trans('hpuswl-auth-phone.forum.alerts.region_invalid')]);
        }
        $regionInfo = ["ChineseMainland" => "86", "HongKong" => "852", "Macao" => "853", "Taiwan" => "886"];
        $phone = $regionInfo[$region] . $phone;

        if ($region != "ChineseMainland") {
            $temp_code = $settings->get('hpuswl-auth-phone.api_sms_ali_template_code_traditional');
        }
        if(self::phoneExist($phone)){
            $msg["status"] = false;
            $msg["msg"] = "phone_exist";
            return $msg;
        }

        $generate = resolve(GenerateCode::class);
        $second = $settings->get('hpuswl-auth-phone.api_sms_ali_expire_second');
        list($res, $status) = $generate->generate($uid, $phone, $second, $ip);
        if ($status){
            $msg["msg"] = "code_exist";
            $msg["time"] = ceil(($res - time())/60);
            return $msg;
        }

        $verificationCode = $res;

        $accessId = $settings->get('hpuswl-auth-phone.api_sms_ali_access_id');
        $accessSecret = $settings->get('hpuswl-auth-phone.api_sms_ali_access_sec');
        $signName = $settings->get('hpuswl-auth-phone.api_sms_ali_sign');

        if (empty($accessId) || empty($accessSecret) || empty($signName) || ($region == "ChineseMainland" && empty($temp_code))) {
            $msg["status"] = false;
            $msg["msg"] = "missing_config";
            return $msg;
        }

        $client = self::createClient($accessId, $accessSecret);
        $sendSmsRequest = new SendSmsRequest([
            "signName" => $signName,
            "templateCode" => $temp_code,
            "phoneNumbers" => $phone,
            "templateParam" => "{\"code\":\"".$verificationCode."\"}"
        ]);
        try {
            // https://help.aliyun.com/document_detail/55288.html
            $runtime = new RuntimeOptions([]);
            $res = $client->sendSmsWithOptions($sendSmsRequest, $runtime);
            if (isset($res->statusCode) && $res->statusCode!=200){
                app('log')->info( $res->statusCode );
                $msg["status"] = false;
                $msg["msg"] = "Aliyun API Error";
                return $msg;
            }

            if (isset($res->body->code) && strtolower($res->body->code)!="ok"){
                app('log')->info( $res->body->code );
                app('log')->info( $res->body->message );
                app('log')->info( $res->body->requestId );

                $msg["status"] = false;
                $msg["msg"] = self::normalizeError($res->body->message);
                return $msg;
            }

            $generate->save($uid, $phone, $verificationCode, $second, $ip);

            $msg["status"] = true;
            return $msg;
        }
        catch (Exception $error) {
            if (!($error instanceof TeaError)) {
                $error = new TeaError([], $error->getMessage(), $error->getCode(), $error);
            }
            app('log')->error( $error->message );
            $msg["msg"] = self::normalizeError($error->message);
            return $msg;
        }
    }

    protected static function normalizeError(string $message): string
    {
        $message = strtolower($message);

        if (strpos($message, 'insufficient balance') !== false ||
            strpos($message, 'insufficientbalance') !== false ||
            strpos($message, 'amount_not_enough') !== false ||
            strpos($message, 'amount not enough') !== false ||
            strpos($message, 'out_of_service') !== false ||
            strpos($message, 'balance') !== false) {
            return 'insufficient_balance';
        }

        return $message;
    }

    public static function phoneExist($phone){
        $disk = resolve(KeyDisk::class);
        $info = $disk->get();
        $en_phone = (new Aes($info["key"],$info["iv"]))->Encrypt($phone);
        $query = Users::select("id","phone")->where(["phone"=>$en_phone])->first();
        if($query){
            return true;
        }
        return false;
    }

}
