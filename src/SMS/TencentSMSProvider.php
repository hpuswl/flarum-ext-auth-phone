<?php

namespace Hpuswl\AuthPhone\SMS;

use Exception;
use TencentCloud\Common\Credential;
use TencentCloud\Common\Exception\TencentCloudSDKException;
use TencentCloud\Common\Profile\ClientProfile;
use TencentCloud\Common\Profile\HttpProfile;
use TencentCloud\Sms\V20210111\Models\SendSmsRequest;
use TencentCloud\Sms\V20210111\SmsClient;

class TencentSMSProvider extends AbstractSMSProvider
{

    public function send(array $data, int $uid, string $ip): array
    {
        $phone = '';
        $templateCodeSetting = 'hpuswl-auth-phone.api_sms_tencent_template_id';

        $allowExist = isset($data['type']) && $data['type'] === 'login';
        $errorResponse = $this->preparePhone($data, $phone, $templateCodeSetting, $allowExist);
        if ($errorResponse) {
            return $errorResponse;
        }

        if ($allowExist) {
            $uid = $this->getUserIdByPhone($phone);
            if (!$uid) {
                return ["status" => false, "msg" => "user_not_found"];
            }
        }

        // For Tencent, if it's traditional, we should use the traditional template setting
        if (isset($data['region']) && $data['region'] !== "ChineseMainland") {
            $templateCodeSetting = 'hpuswl-auth-phone.api_sms_tencent_template_id_traditional';
        }

        $expireSecond = (int) $this->settings->get('hpuswl-auth-phone.api_sms_tencent_expire_second', 300);
        $result = $this->generateCode($uid, $phone, $ip, $expireSecond);
        if (!$result['status']) {
            return $result;
        }

        $verificationCode = $result['code'];

        $secretId = $this->settings->get('hpuswl-auth-phone.api_sms_tencent_secret_id') ?: getenv("TENCENTCLOUD_SECRET_ID");
        $secretKey = $this->settings->get('hpuswl-auth-phone.api_sms_tencent_secret_key') ?: getenv("TENCENTCLOUD_SECRET_KEY");
        $region = $this->settings->get('hpuswl-auth-phone.api_sms_tencent_region', 'ap-guangzhou');
        $appId = $this->settings->get('hpuswl-auth-phone.api_sms_tencent_app_id');
        $signName = $this->settings->get('hpuswl-auth-phone.api_sms_tencent_sign_name');
        $templateId = $this->settings->get($templateCodeSetting);

        if (empty($secretId) || empty($secretKey) || empty($appId) || (isset($data['region']) && $data['region'] === "ChineseMainland" && empty($templateId))) {
            return ["status" => false, "msg" => "missing_config"];
        }

        try {
            $cred = new Credential($secretId, $secretKey);

            $httpProfile = new HttpProfile();
            $httpProfile->setEndpoint("sms.tencentcloudapi.com");

            $clientProfile = new ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);

            $client = new SmsClient($cred, $region, $clientProfile);

            $req = new SendSmsRequest();

            $params = [
                "PhoneNumberSet" => ["+" . $phone],
                "SmsSdkAppId" => $appId,
                "SignName" => $signName,
                "TemplateId" => $templateId,
                "TemplateParamSet" => [(string)$verificationCode]
            ];
            $req->fromJsonString(json_encode($params));

            $resp = $client->SendSms($req);
            $respArray = json_decode($resp->toJsonString(), true);

            if (isset($respArray['Error'])) {
                app('log')->error("Tencent SMS SDK Error: Code: " . $respArray['Error']['Code'] . ", Message: " . $respArray['Error']['Message']);
                return ["status" => false, "msg" => $this->normalizeError($respArray['Error']['Code'] . " " . $respArray['Error']['Message'])];
            }

            $statusSet = $respArray['SendStatusSet'][0];
            if ($statusSet['Code'] !== 'Ok') {
                app('log')->error("Tencent SMS SDK Send Failed: Code: " . $statusSet['Code'] . ", Message: " . $statusSet['Message']);
                return ["status" => false, "msg" => $this->normalizeError($statusSet['Code'] . " " . $statusSet['Message'])];
            }

            $this->saveCode($uid, $phone, $verificationCode, $ip, $expireSecond);

            return ["status" => true];
        } catch (TencentCloudSDKException $e) {
            app('log')->error("Tencent SMS SDK Exception: " . $e->getMessage());
            return ["status" => false, "msg" => $this->normalizeError($e->getMessage())];
        } catch (Exception $e) {
            app('log')->error("Tencent SMS General Exception: " . $e->getMessage());
            return ["status" => false, "msg" => $e->getMessage()];
        }
    }
}
