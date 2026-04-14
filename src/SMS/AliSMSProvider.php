<?php

namespace Hpuswl\AuthPhone\SMS;

use Hpuswl\AuthPhone\Common\AliSMS;

class AliSMSProvider extends AbstractSMSProvider
{
    public function send(array $data, int $uid, string $ip): array
    {
        $sms = new AliSMS();
        $smsResponse = $sms->send($data, $uid, $ip);

        if ($smsResponse['status']) {
            return ['status' => true];
        }

        return ['status' => false, 'msg' => $smsResponse['msg']];
    }
}
