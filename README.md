# Hpuswl Auth Phone

A [Flarum](http://flarum.org) extension. auth by phone sms once code

**Now supports multiple SMS providers: Alibaba Cloud, Tencent Cloud, Huawei Cloud, and Qiniu Cloud.**

**现在支持多家短信服务商：阿里云、腾讯云、华为云、七牛云。**

### Installation

Install manually with composer:

```sh
composer require hpuswl/flarum-ext-auth-phone
```
  
```sh
php flarum hpuswl:aesKey:build
```

### Updating

```sh
php flarum migrate

composer update hpuswl/flarum-ext-auth-phone
```

### Links

- [Packagist](https://packagist.org/packages/hpuswl/flarum-ext-auth-phone)

```
 "require-dev": {
        "hpuswl/flarum-ext-auth-phone":"@dev"
    }
```

php flarum migrate

---

## 会话总结 (2026-04-13)

- **主要目的**: 完善 Flarum 短信验证插件的功能、优化 UI 并完成品牌更名。
- **主要任务**:
    - 后台管理增强：在后台用户列表中增加手机号显示，并支持在添加/编辑用户时直接录入手机号。
    - UI/UX 优化：美化前台短信验证弹窗，增加 60 秒倒计时功能，适配主题色按钮。
    - 港澳台支持：增加“开启港澳台手机号支持”配置开关，前端根据开关动态显示/隐藏地区选择。
    - Bug 修复：修复了所有短信提供商中由于配置读取导致的 `generateCode` 参数类型错误。
- **关键决策和解决方案**:
    - 使用 `extend` API 扩展 `UserSerializer`，仅对管理员暴露加密手机号。
    - 在 `SavePhone` 监听器中增加管理员权限判定，绕过管理员操作时的短信验证码校验。
    - 引入 Flarum CSS 变量（如 `--primary-color`）实现 UI 的自动配色适配。
    - 显式类型转换 `(int)` 解决 PHP 强类型函数的参数传递问题。
- **使用的技术栈**: PHP, Mithril.js, Less, Flarum API, GuzzleHttp.
- **修改的文件**:
    - [composer.json](.flarum/packages/flarum-ext-auth-phone/composer.json)
    - [extend.php](.flarum/packages/flarum-ext-auth-phone/extend.php)
    - [js/package.json](.flarum/packages/flarum-ext-auth-phone/js/package.json)
    - [js/src/admin/index.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/index.js)
    - [js/src/forum/index.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/index.js)
    - [js/src/admin/components/SettingsPage.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/SettingsPage.js)
    - [js/src/admin/components/UserList.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/UserList.js)
    - [js/src/forum/components/LinkModal.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/components/LinkModal.js)
    - [resources/less/forum.less](.flarum/packages/flarum-ext-auth-phone/resources/less/forum.less)
    - [resources/locale/zh.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/zh.yml)
    - [resources/locale/en.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/en.yml)
    - [src/Listener/SavePhone.php](.flarum/packages/flarum-ext-auth-phone/src/Listener/SavePhone.php)
    - [src/SMS/AliSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/AliSMSProvider.php)
    - [src/SMS/TencentSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/TencentSMSProvider.php)
    - [src/SMS/HuaweiSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/HuaweiSMSProvider.php)
    - [src/SMS/QiniuSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/QiniuSMSProvider.php)

- **主要目的**: 接入腾讯云官方 SDK 并优化错误处理。
- **主要任务**:
    - 在 `composer.json` 中引入 `tencentcloud/tencentcloud-sdk-php`。
    - 重构 `TencentSMSProvider.php`，使用官方 SDK 代替手动构造的 API 请求。
    - 在后端增加错误消息归一化逻辑，捕获各服务商返回的“余额不足”等原始错误信息。
    - 增加 `insufficient_balance` 翻译项，提供友好的用户提示。
- **关键决策和解决方案**:
    - 使用 `TencentCloud\Sms\V20210111\SmsClient` 规范化腾讯云短信调用。
    - 在 `AbstractSMSProvider` 中实现 `normalizeError` 方法，通过关键字匹配映射错误标识。
- **修改的文件**:
    - [composer.json](.flarum/packages/flarum-ext-auth-phone/composer.json)
    - [src/SMS/TencentSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/TencentSMSProvider.php)
    - [resources/locale/zh.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/zh.yml)
    - [resources/locale/en.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/en.yml)
    - [src/SMS/AbstractSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/AbstractSMSProvider.php)
    - [src/Common/AliSMS.php](.flarum/packages/flarum-ext-auth-phone/src/Common/AliSMS.php)
    - [src/SMS/HuaweiSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/HuaweiSMSProvider.php)
    - [src/SMS/QiniuSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/QiniuSMSProvider.php)

    - 以及 `src/` 目录下所有涉及命名空间修改的文件。

- **主要目的**: 修复前端提示信息自动消失逻辑。
- **主要任务**:
    - 为所有前端错误提示（包括“手机号格式错误”）增加 5 秒自动消失逻辑。
    - 修复解绑手机号弹窗中成功提示与页面刷新的竞争逻辑。
- **关键决策和解决方案**:
    - 在调用 `app.alerts.show` 后使用 `setTimeout` 配合 `app.alerts.dismiss` 实现自动隐藏。
- **使用的技术栈**: Mithril.js, Flarum Frontend API.
- **修改的文件**:
    - [js/src/forum/components/LinkModal.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/components/LinkModal.js)
    - [js/src/forum/index.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/index.js)
    - [js/src/forum/components/UnlinkModal.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/components/UnlinkModal.js)

- **主要目的**: 规范前端代码引用，减少编译警告。
- **主要任务**:
    - 在所有 JS 文件中补充缺失的 `import app from 'flarum/.../app'` 引用。
    - 修正后台 JS 中直接 ES6 引用前台组件（如 `SignUpModal`）导致的 Webpack 解析警告，改为使用 `flarum.core.compat` 运行时获取。
    - 统一后台代码使用 `flarum/admin/app`，前台代码使用 `flarum/forum/app`。
- **关键决策和解决方案**:
    - 遵循 Flarum 模块化规范，确保每个文件独立声明依赖。
- **修改的文件**:
    - [js/src/admin/index.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/index.js)
    - [js/src/admin/components/UserList.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/UserList.js)
    - [js/src/admin/components/SettingsPage.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/SettingsPage.js)
    - [js/src/forum/components/LinkModal.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/components/LinkModal.js)
    - [js/src/forum/components/UnlinkModal.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/components/UnlinkModal.js)


- **主要目的**: 修复 cURL error 60 SSL 证书错误。
- **主要任务**:
    - 在后台配置页面增加“忽略 SSL 证书检查”开关。
    - 在阿里云、腾讯云、华为云、七牛云短信提供商中增加对该配置的支持，允许在证书配置不正确的环境下发送短信。
- **关键决策和解决方案**:
    - 在 Guzzle 客户端初始化及请求时显式增加 `['verify' => !$ignoreSsl]` 参数。
    - 针对阿里云 SDK，在 `RuntimeOptions` 中设置 `ignoreSSL = true`。
- **修改的文件**:
    - [resources/locale/zh.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/zh.yml)
    - [resources/locale/en.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/en.yml)
    - [js/src/admin/components/SettingsPage.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/SettingsPage.js)
    - [src/Common/AliSMS.php](.flarum/packages/flarum-ext-auth-phone/src/Common/AliSMS.php)
    - [src/SMS/TencentSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/TencentSMSProvider.php)
    - [src/SMS/HuaweiSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/HuaweiSMSProvider.php)
    - [src/SMS/QiniuSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/QiniuSMSProvider.php)

## 会话总结 (2026-04-13 追加)

- **主要目的**: 参考官方登录逻辑，完善短信验证码登录功能。
- **主要任务**:
    - 添加 `SessionAuthenticator` 支持，实现会话登录。
    - 添加 `Dispatcher` 支持，触发 `LoggedIn` 事件。
    - 添加 `Rememberer` 支持，正确处理记住我功能。
    - 添加 `UserRepository` 依赖。
    - 参考官方逻辑添加 `@inheritdoc` 注解。
- **关键决策和解决方案**:
    - 按照官方 `LogInController` 的结构组织依赖注入。
    - 在有session时进行会话登录并触发事件。
    - 根据 `remember` 参数选择生成对应的token类型。
- **修改的文件**:
    - [src/Controllers/PhoneLoginController.php](.flarum/packages/flarum-ext-auth-phone/src/Controllers/PhoneLoginController.php)

## 会话总结 (2026-04-13 追加)

- **主要目的**: 修复短信验证码发送/校验与配置读取问题，移除忽略 SSL 配置。
- **主要任务**:
    - 修复注册/绑定/登录验证码校验与过期判断。
    - 仅在短信发送成功后保存验证码记录。
    - 统一短信服务商后台配置 Key 为 `api_sms_*`，并修复后台设置页字段名不一致导致的缺参问题。
    - 默认 `region` 为 `ChineseMainland`（未传参时）。
    - 移除 `ignore_ssl` 配置与相关实现。
- **关键决策和解决方案**:
    - 将验证码生成与持久化分离，成功发送后再落库。
    - 后端严格禁止回传/暴露密钥等敏感配置。
- **使用的技术栈**: PHP, Flarum, Mithril.js, Webpack.
- **修改的文件**:
    - [js/src/forum/index.js](.flarum/packages/flarum-ext-auth-phone/js/src/forum/index.js)
    - [js/src/admin/components/SettingsPage.js](.flarum/packages/flarum-ext-auth-phone/js/src/admin/components/SettingsPage.js)
    - [resources/locale/zh.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/zh.yml)
    - [resources/locale/en.yml](.flarum/packages/flarum-ext-auth-phone/resources/locale/en.yml)
    - [src/Listener/SavePhone.php](.flarum/packages/flarum-ext-auth-phone/src/Listener/SavePhone.php)
    - [src/Controllers/PhoneLoginController.php](.flarum/packages/flarum-ext-auth-phone/src/Controllers/PhoneLoginController.php)
    - [src/SMS/SMSManager.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/SMSManager.php)
    - [src/SMS/AbstractSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/AbstractSMSProvider.php)
    - [src/Common/GenerateCode.php](.flarum/packages/flarum-ext-auth-phone/src/Common/GenerateCode.php)
    - [src/Common/AliSMS.php](.flarum/packages/flarum-ext-auth-phone/src/Common/AliSMS.php)
    - [src/SMS/TencentSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/TencentSMSProvider.php)
    - [src/SMS/HuaweiSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/HuaweiSMSProvider.php)
    - [src/SMS/QiniuSMSProvider.php](.flarum/packages/flarum-ext-auth-phone/src/SMS/QiniuSMSProvider.php)

