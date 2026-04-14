import { extend, override } from 'flarum/common/extend';
import addAlert from './addAlert';
import app from 'flarum/forum/app';

export * from './components';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import LogInModal from 'flarum/forum/components/LogInModal';

import UnlinkModal from "./components/UnlinkModal";
import LinkModal from "./components/LinkModal";

import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';

/* global m */

//packname:flarum-ext-auth-phone  modulename:hpuswl-auth-phone
app.initializers.add('hpuswl/flarum-ext-auth-phone', () => {
    addAlert();

    if (SettingsPage) {
        extend(SettingsPage.prototype, 'accountItems', function(items) {
            const user = app.session.user;
            if (!user) return;

            const smsAuth = user.attribute('SMSAuth');
            if (!smsAuth) return;

            const isAuth = smsAuth.isAuth;

            items.add(`linkSMSAuth`,
                <Button className={`Button linkSMSAuthButton--${isAuth ? 'danger' : 'success'}`} icon="fas fa-id-badge"
                    onclick={() => app.modal.show(isAuth ? UnlinkModal : LinkModal)}>
                    {app.translator.trans(`hpuswl-auth-phone.forum.buttons.${isAuth ? 'unlink' : 'link'}`)}
                </Button>
            );
        });
    }

    if (SignUpModal) {
        // 移除注册时的手机号逻辑，因为注册不再需要手机号
    }

    if (LogInModal) {
        // 扩展登录模态框
        extend(LogInModal.prototype, 'oninit', function() {
            this.loginWithPhone = this.loginWithPhone || false;
            this.phone = this.phone || "";
            this.region = this.region || "ChineseMainland";
            this.code = this.code || "";
            this.smsLoading = this.smsLoading || false;
            this.displayCode = this.displayCode || false;
            this.displaySend = this.displaySend || "block";
            this.countdown = 0;
        });

        extend(LogInModal.prototype, 'fields', function(items) {
            if (this.loginWithPhone) {
                // 移除原有的用户名/邮箱和密码字段
                items.remove('identification');
                items.remove('password');

                const showRegion = app.forum.attribute('hpuswlAuthPhonePostChineseLand');

                items.add('phone', (
                    <div className="Form-group">
                        <div className="SMSAuth-inputGroup">
                            {showRegion && (
                                <Select
                                    options={{ ChineseMainland: '86', HongKong: '852', Macao: "853", Taiwan: "886" }}
                                    value={this.region}
                                    onchange={(val) => this.region = val}
                                    disabled={this.loading || this.displayCode}
                                />
                            )}
                            <input
                                className="FormControl"
                                name="phone"
                                type="text"
                                placeholder={app.translator.trans('hpuswl-auth-phone.forum.modals.link.phone')}
                                value={this.phone}
                                oninput={(e) => this.phone = e.target.value}
                                disabled={this.loading || this.displayCode}
                            />
                        </div>
                    </div>
                ), 20);

                if (this.displayCode) {
                    items.add('code', (
                        <div className="Form-group">
                            <div className="SMSAuth-codeGroup">
                                <input
                                    className="FormControl"
                                    name="code"
                                    type="text"
                                    placeholder={app.translator.trans('hpuswl-auth-phone.forum.modals.link.code')}
                                    value={this.code}
                                    oninput={(e) => this.code = e.target.value}
                                    disabled={this.loading}
                                />
                                <Button
                                    className="Button"
                                    disabled={this.countdown > 0 || this.smsLoading}
                                    onclick={() => sendSMS.call(this, 'login')}
                                >
                                    {this.countdown > 0 ? `${this.countdown}s` : app.translator.trans('hpuswl-auth-phone.forum.buttons.send')}
                                </Button>
                            </div>
                        </div>
                    ), 19);
                } else {
                    items.add('sendCode', (
                        <div className="Form-group">
                            <Button
                                className="Button Button--primary Button--block LogInButton--SMSAuth"
                                loading={this.smsLoading}
                                disabled={this.loading}
                                onclick={() => sendSMS.call(this, 'login')}
                            >
                                {app.translator.trans('hpuswl-auth-phone.forum.buttons.send')}
                            </Button>
                        </div>
                    ), 18);
                }
            }

            items.add('toggleLoginMethod', (
                <div className="Form-group">
                    <span className="SMSAuth-toggleLink" onclick={() => {
                        this.loginWithPhone = !this.loginWithPhone;
                        this.displayCode = false;
                        this.displaySend = "block";
                        this.countdown = 0;
                        m.redraw();
                    }}>
                        {app.translator.trans(`hpuswl-auth-phone.forum.buttons.${this.loginWithPhone ? 'login_with_password' : 'login_with_phone'}`)}
                    </span>
                </div>
            ), -10);
        });

        override(LogInModal.prototype, 'onsubmit', function(original, e) {
            e.preventDefault();
            this.loading = true;

            if (this.loginWithPhone) {
                app.request({
                    url: app.forum.attribute('apiUrl') + "/auth/sms/login",
                    method: 'POST',
                    body: {
                        phone: this.phone,
                        region: this.region,
                        code: this.code,
                        remember: this.remember()
                    },
                    errorHandler: this.onerror.bind(this)
                }).then(() => window.location.reload())
                .catch(() => {
                    this.loading = false;
                    m.redraw();
                });
            } else {
                original(e);
            }
        });
    }
});

function startCountdown() {
    this.countdown = 60;
    const interval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
            clearInterval(interval);
        }
        m.redraw();
    }, 1000);
}

function sendSMS(type = 'register') {
    const phone = this.phone;
    const region = this.region;

    if (!phone) {
        const alert = app.alerts.show({ type: 'error' }, app.translator.trans('hpuswl-auth-phone.forum.alerts.wrong_num'));
        setTimeout(() => app.alerts.dismiss(alert), 5000);
        return;
    }

    if (region === "ChineseMainland" && phone.length !== 11) {
        const alert = app.alerts.show({ type: 'error' }, app.translator.trans('hpuswl-auth-phone.forum.alerts.wrong_num'));
        setTimeout(() => app.alerts.dismiss(alert), 5000);
        return;
    }

    this.smsLoading = true;

    app.request({
        url: app.forum.attribute('apiUrl') + "/auth/sms/send",
        method: 'POST',
        body: { phone, region, type },
    }).then((result) => {
        this.smsLoading = false;
        if (!result.status) {
            let msg = result.msg;
            if (result.msg === "code_exist") {
                this.displayCode = true;
                this.displaySend = "none";
                this.countdown = result.time * 60;
                startCountdown.call(this);
                msg = app.translator.trans('hpuswl-auth-phone.forum.alerts.code_exist', { time: result.time });
            } else if (app.translator.trans('hpuswl-auth-phone.forum.alerts.' + result.msg) !== 'hpuswl-auth-phone.forum.alerts.' + result.msg) {
                msg = app.translator.trans('hpuswl-auth-phone.forum.alerts.' + result.msg);
            }
            const alert = app.alerts.show({ type: 'error' }, msg);
            setTimeout(() => app.alerts.dismiss(alert), 5000);
            return;
        }
        this.displayCode = true;
        this.displaySend = "none";
        startCountdown.call(this);
        const alert = app.alerts.show({ type: 'success' }, app.translator.trans('hpuswl-auth-phone.forum.alerts.send_success'));
        setTimeout(() => app.alerts.dismiss(alert), 5000);
        m.redraw();
    }).catch((error) => {
        this.smsLoading = false;
        m.redraw();
    });
}
