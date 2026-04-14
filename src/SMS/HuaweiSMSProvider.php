<?php

namespace Hpuswl\AuthPhone\SMS;

use GuzzleHttp\Client;
use Exception;

class HuaweiSMSProvider extends AbstractSMSProvider
{
    public function send(array $data, int $uid, string $ip): array
    {
        $phone = '';
        $templateCodeSetting = 'hpuswl-auth-phone.api_sms_huawei_template_id';
        
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

        // For Huawei, if it's traditional, we should use the traditional template setting
        if (isset($data['region']) && $data['region'] !== "ChineseMainland") {
            $templateCodeSetting = 'hpuswl-auth-phone.api_sms_huawei_template_id_traditional';
        }

        $expireSecond = (int) $this->settings->get('hpuswl-auth-phone.api_sms_huawei_expire_second', 300);
        $result = $this->generateCode($uid, $phone, $ip, $expireSecond);
        if (!$result['status']) {
            return $result;
        }

        $verificationCode = $result['code'];

        $appKey = $this->settings->get('hpuswl-auth-phone.api_sms_huawei_app_key');
        $appSecret = $this->settings->get('hpuswl-auth-phone.api_sms_huawei_app_secret');
        $endpoint = $this->settings->get('hpuswl-auth-phone.api_sms_huawei_endpoint');
        $sender = $this->settings->get('hpuswl-auth-phone.api_sms_huawei_sender');
        $templateId = $this->settings->get($templateCodeSetting);
        $signature = $this->settings->get('hpuswl-auth-phone.api_sms_huawei_signature');

        // Huawei SMS API Implementation using Guzzle
        try {
            $client = new Client();
            $url = $endpoint . '/sms/batchSendSms/v1';

            date_default_timezone_set('Asia/Shanghai');
            $now = date('Y-m-dTH:i:sZ');
            $nonce = uniqid();
            $passwordDigest = base64_encode(hash('sha256', $nonce . $now . $appSecret, true));

            $wsseHeader = sprintf(
                'UsernameToken Username="%s",PasswordDigest="%s",Nonce="%s",Created="%s"',
                $appKey,
                $passwordDigest,
                $nonce,
                $now
            );

            $payload = [
                'from' => $sender,
                'to' => "+" . $phone,
                'templateId' => $templateId,
                'templateParas' => json_encode([(string)$verificationCode]),
            ];

            if (!empty($signature)) {
                $payload['signature'] = $signature;
            }

            $response = $client->post($url, [
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Authorization' => 'WSSE realm="SDP",profile="UsernameToken",type="Appkey"',
                    'X-WSSE' => $wsseHeader,
                ],
                'form_params' => $payload,
                'verify' => false
            ]);

            $respBody = json_decode($response->getBody()->getContents(), true);

            if ($respBody['code'] !== '000000') {
                app('log')->error("Huawei SMS Send Failed: " . $respBody['description']);
                return ["status" => false, "msg" => $this->normalizeError($respBody['description'])];
            }

            $this->saveCode($uid, $phone, $verificationCode, $ip, $expireSecond);

            return ["status" => true];
        } catch (Exception $e) {
            app('log')->error("Huawei SMS Exception: " . $e->getMessage());
            return ["status" => false, "msg" => $e->getMessage()];
        }
    }
}
