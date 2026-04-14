<?php

namespace Hpuswl\AuthPhone\SMS;

use Flarum\Settings\SettingsRepositoryInterface;
use Hpuswl\AuthPhone\Common\Aes;
use Hpuswl\AuthPhone\Common\GenerateCode;
use Hpuswl\AuthPhone\KeyDisk;
use Hpuswl\AuthPhone\Users;
use Flarum\Foundation\ValidationException;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class AbstractSMSProvider implements SMSProviderInterface
{
    protected $settings;
    protected $translator;
    protected $generate;
    protected $disk;

    public function __construct(
        SettingsRepositoryInterface $settings,
        TranslatorInterface $translator,
        GenerateCode $generate,
        KeyDisk $disk
    ) {
        $this->settings = $settings;
        $this->translator = $translator;
        $this->generate = $generate;
        $this->disk = $disk;
    }

    /**
     * Common logic to validate phone number existence.
     */
    protected function phoneExist(string $phone): bool
    {
        $info = $this->disk->get();
        $en_phone = (new Aes($info["key"], $info["iv"]))->Encrypt($phone);
        return Users::where("phone", $en_phone)->exists();
    }

    /**
     * Validate region and get phone number with international prefix if needed.
     */
    protected function preparePhone(array $data, &$phone, &$templateCodeSetting, bool $allowExist = false): ?array
    {
        $phone = isset($data["phone"]) ? $data["phone"] : null;
        $region = isset($data["region"]) ? $data["region"] : "ChineseMainland";

        if (!$phone || !$region) {
            return ["status" => false, "msg" => "param is invalid"];
        }

        if (!in_array($region, ["ChineseMainland", "HongKong", "Macao", "Taiwan"])) {
            throw new ValidationException(["msg" => $this->translator->trans('hpuswl-auth-phone.forum.alerts.region_invalid')]);
        }

        $regionInfo = ["ChineseMainland" => "86", "HongKong" => "852", "Macao" => "853", "Taiwan" => "886"];
        $phone = $regionInfo[$region] . $phone;

        if ($region != "ChineseMainland") {
            $templateCodeSetting = 'hpuswl-auth-phone.api_sms_ali_template_code_traditional'; // Default to Ali, but can be overridden
        }

        if (!$allowExist && $this->phoneExist($phone)) {
            return ["status" => false, "msg" => "phone_exist"];
        }

        return null;
    }

    protected function getUserIdByPhone(string $phone): int
    {
        $info = $this->disk->get();
        $en_phone = (new Aes($info["key"], $info["iv"]))->Encrypt($phone);
        $user = Users::where("phone", $en_phone)->first();
        return $user ? $user->id : 0;
    }

    /**
     * Generate verification code.
     */
    protected function generateCode(int $uid, string $phone, string $ip, int $expireSeconds): array
    {
        list($res, $status) = $this->generate->generate($uid, $phone, $expireSeconds, $ip);
        if ($status) {
            return [
                "status" => false,
                "msg" => "code_exist",
                "time" => ceil(($res - time()) / 60)
            ];
        }

        return ["status" => true, "code" => $res];
    }

    /**
     * Save verification code to cache.
     */
    protected function saveCode(int $uid, string $phone, string $code, string $ip, int $expireSeconds): void
    {
        $this->generate->save($uid, $phone, $code, $expireSeconds, $ip);
    }

    /**
     * Normalize error messages from different providers.
     */
    protected function normalizeError(string $message): string
    {
        $message = strtolower($message);

        if (strpos($message, 'insufficient balance') !== false ||
            strpos($message, 'insufficientbalance') !== false ||
            strpos($message, 'amount_not_enough') !== false ||
            strpos($message, 'amount not enough') !== false ||
            strpos($message, 'out_of_service') !== false ||
            strpos($message, 'e200028') !== false ||
            strpos($message, 'balance') !== false) {
            return 'insufficient_balance';
        }

        return $message;
    }
}
