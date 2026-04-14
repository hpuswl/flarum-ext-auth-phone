<?php

namespace Hpuswl\AuthPhone\SMS;

use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

class SMSManager
{
    protected $container;
    protected $settings;
    protected $providers = [];

    public function __construct(Container $container, SettingsRepositoryInterface $settings)
    {
        $this->container = $container;
        $this->settings = $settings;
    }

    /**
     * Get the configured SMS provider.
     */
    public function driver(): SMSProviderInterface
    {
        $driverName = $this->settings->get('hpuswl-auth-phone.api_sms_provider', 'aliyun');
        return $this->resolve($driverName);
    }

    /**
     * Resolve the SMS provider by name.
     */
    protected function resolve(string $name): SMSProviderInterface
    {
        if (isset($this->providers[$name])) {
            return $this->providers[$name];
        }

        $method = 'create' . ucfirst($name) . 'Driver';

        if (method_exists($this, $method)) {
            return $this->providers[$name] = $this->$method();
        }

        throw new InvalidArgumentException("SMS driver [{$name}] not supported.");
    }

    protected function createAliyunDriver(): AliSMSProvider
    {
        return $this->container->make(AliSMSProvider::class);
    }

    protected function createTencentDriver(): TencentSMSProvider
    {
        return $this->container->make(TencentSMSProvider::class);
    }

    protected function createHuaweiDriver(): HuaweiSMSProvider
    {
        return $this->container->make(HuaweiSMSProvider::class);
    }

    protected function createQiniuDriver(): QiniuSMSProvider
    {
        return $this->container->make(QiniuSMSProvider::class);
    }
}
