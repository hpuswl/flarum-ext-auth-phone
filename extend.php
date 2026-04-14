<?php

/*
 * This file is part of hpuswl/flarum-ext-auth-phone.
 *
 * Copyright (c) 2022 Solvay.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Hpuswl\AuthPhone;

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\Event\Saving;

use Hpuswl\AuthPhone\Listener\SavePhone;
use Hpuswl\AuthPhone\Middlewares\DiscussionMiddleware;
use Hpuswl\AuthPhone\Console\BuildKeyCommand;
use Hpuswl\AuthPhone\Common\Aes;
use Hpuswl\AuthPhone\KeyDisk;

use Flarum\Foundation\Paths;
use Hpuswl\AuthPhone\Middlewares\BioLimitMiddleware;

return [
    //前端文件
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),
    
    //翻译
    new Extend\Locales(__DIR__ . '/resources/locale'),

    //接口
    (new Extend\Routes('api'))
        ->post('/auth/sms/send', 'auth.sms.api.send', Controllers\SMSSendController::class)
        ->post('/auth/sms/login', 'auth.sms.api.login', Controllers\PhoneLoginController::class),

    //发帖限制
    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attribute('canStartDiscussion', function (ForumSerializer $serializer) {
            if($serializer->getActor()->phone){
                return true;
            }
            return false;
    }),

    //接口限制
    (new Extend\Middleware('api'))
        ->add(DiscussionMiddleware::class)
        ,

    //事件监听
    (new Extend\Event())
        ->listen(Saving::class, SavePhone::class)
        ->listen(Saving::class, BioLimitMiddleware::class)
        ,

    //aes 秘钥存储
    (new Extend\Filesystem())
        ->disk('flarum-aes', function (Paths $paths) {
            return [
                'root'   => "$paths->storage/key",
            ];
    }),

    (new Extend\Console())->command(BuildKeyCommand::class),

    //初始化页面状态
    (new Extend\ApiSerializer(UserSerializer::class))
        ->attributes(function($serializer, $user, $attributes) {
            $isAuth = false;
            if ($user->phone){
                $isAuth = true;
            }
            $attributes['SMSAuth'] = [
                'isAuth' => $isAuth
            ];

            if ($serializer->getActor()->isAdmin()) {
                $disk = resolve(KeyDisk::class);
                $info = $disk->get();
                $aes = new Aes($info["key"], $info["iv"]);
                $attributes['phone'] = $user->phone ? $aes->Decrypt($user->phone) : '';
                $attributes['phone_region'] = $user->phone_region;
            }

            return $attributes;
        }),

    (new Extend\Settings())
        ->serializeToForum('hpuswlAuthPhoneSupportTraditional', 'hpuswl-auth-phone.support_traditional', 'boolVal')
        ->serializeToForum('hpuswlAuthPhonePostChineseLand', 'hpuswlAuthPhonePostChineseLand', 'boolVal')
        ->serializeToForum('hpuswlAuthPhoneTips', 'hpuswlAuthPhoneTips', 'boolVal')
        ->serializeToForum('hpuswlAuthPhoneTipsOneTitle', 'hpuswlAuthPhoneTipsOneTitle')
        ->serializeToForum('hpuswlAuthPhoneTipsOneUrl', 'hpuswlAuthPhoneTipsOneUrl')
        ->serializeToForum('hpuswlAuthPhoneTipsTwoTitle', 'hpuswlAuthPhoneTipsTwoTitle')
        ->serializeToForum('hpuswlAuthPhoneTipsTwoUrl', 'hpuswlAuthPhoneTipsTwoUrl')
        ->serializeToForum('hpuswlAuthPhoneTipsThreeTitle', 'hpuswlAuthPhoneTipsThreeTitle')
        ->serializeToForum('hpuswlAuthPhoneTipsThreeUrl', 'hpuswlAuthPhoneTipsThreeUrl')
        ,
];
