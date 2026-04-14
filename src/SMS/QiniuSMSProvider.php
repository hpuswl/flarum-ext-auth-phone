<?php

namespace Hpuswl\AuthPhone\SMS;

use GuzzleHttp\Client;
use Exception;

class QiniuSMSProvider extends AbstractSMSProvider
{
    public function send(array $data, int $uid, string $ip): array
    {
        $phone = '';
        $templateCodeSetting = 'hpuswl-auth-phone.api_sms_qiniu_template_id';
        
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

        // For Qiniu, if it's traditional, we should use the traditional template setting
        if (isset($data['region']) && $data['region'] !== "ChineseMainland") {
            $templateCodeSetting = 'hpuswl-auth-phone.api_sms_qiniu_template_id_traditional';
        }

        $expireSecond = (int) $this->settings->get('hpuswl-auth-phone.api_sms_qiniu_expire_second', 300);
        $result = $this->generateCode($uid, $phone, $ip, $expireSecond);
        if (!$result['status']) {
            return $result;
        }

        $verificationCode = $result['code'];

        $accessKey = $this->settings->get('hpuswl-auth-phone.api_sms_qiniu_access_key');
        $secretKey = $this->settings->get('hpuswl-auth-phone.api_sms_qiniu_secret_key');
        $templateId = $this->settings->get($templateCodeSetting);
        $signature = $this->settings->get('hpuswl-auth-phone.api_sms_qiniu_signature');

        // Qiniu SMS API Implementation using Guzzle
        try {
            $client = new Client();
            $url = 'https://sms.qiniuapi.com/v1/message';
            $path = '/v1/message';
            $method = 'POST';

            $payload = json_encode([
                'template_id' => $templateId,
                'mobiles' => [(string)$phone],
                'parameters' => [
                    'code' => (string)$verificationCode
                ]
            ]);

            $token = $this->generateToken($accessKey, $secretKey, $url, $method, $payload);

            $response = $client->post($url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => $token,
                ],
                'body' => $payload
            ]);

            $respBody = json_decode($response->getBody()->getContents(), true);

            if ($response->getStatusCode() !== 200) {
                $errorMsg = isset($respBody['error']) ? $respBody['error'] : 'Qiniu API Error';
                app('log')->error("Qiniu SMS Send Failed: " . $errorMsg);
                return ["status" => false, "msg" => $this->normalizeError($errorMsg)];
            }

            $this->saveCode($uid, $phone, $verificationCode, $ip, $expireSecond);

            return ["status" => true];
        } catch (Exception $e) {
            app('log')->error("Qiniu SMS Exception: " . $e->getMessage());
            return ["status" => false, "msg" => $e->getMessage()];
        }
    }

    private function generateToken($accessKey, $secretKey, $url, $method, $body)
    {
        $parsedUrl = parse_url($url);
        $path = $parsedUrl['path'];
        if (isset($parsedUrl['query'])) {
            $path .= '?' . $parsedUrl['query'];
        }

        $data = $method . " " . $path . "\nHost: " . $parsedUrl['host'] . "\nContent-Type: application/json\n\n" . $body;
        $sign = hash_hmac('sha1', $data, $secretKey, true);
        $encodedSign = $this->base64UrlSafeEncode($sign);

        return "Qiniu " . $accessKey . ":" . $encodedSign;
    }

    private function base64UrlSafeEncode($data)
    {
        return str_replace(['+', '/'], ['-', '_'], base64_encode($data));
    }
}
