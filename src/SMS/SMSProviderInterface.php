<?php

namespace Hpuswl\AuthPhone\SMS;

interface SMSProviderInterface
{
    /**
     * Send SMS to the specified phone number.
     * 
     * @param array $data Input data (phone, region, etc.)
     * @param int $uid User ID
     * @param string $ip User IP
     * @return array Response array with 'status' and 'msg' keys.
     */
    public function send(array $data, int $uid, string $ip): array;
}
