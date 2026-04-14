import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Alert from 'flarum/common/components/Alert';
import Link from 'flarum/common/components/Link';

export default class LinkModal extends Modal {
    oninit(vnode){
        super.oninit(vnode);
        this.region = "ChineseMainland";
        this.phone = "";
        this.code = "";
        this.loading = false;
        this.inputDisabled = false;
        this.display = false;
        this.displaySend = "block";
        this.countdown = 0;
    }

    className() {
        return `SMSAuthLinkModal Modal--small`;
    }

    title() {
        return app.translator.trans(`hpuswl-auth-phone.forum.modals.link.title`);
    }

    content() {        
        const showRegion = app.forum.attribute('hpuswlAuthPhonePostChineseLand');
        return (
            <div className="Modal-body">
                <div className="Form">
                    <div className="Form-group">
                        <div className="SMSAuth-inputGroup">
                            {showRegion && Select.component({
                                options: { ChineseMainland: '86', HongKong: '852', Macao:"853", Taiwan:"886" },
                                value: this.region,
                                onchange: (val) => this.region = val,
                                disabled: this.inputDisabled
                            })}

                            <input class="FormControl" 
                                placeholder={app.translator.trans(`hpuswl-auth-phone.forum.modals.link.phone`)}
                                oninput={e => this.phone = e.target.value}
                                disabled={this.inputDisabled}
                                value={this.phone}
                            />
                        </div>

                        <div className="SMSAuth-codeGroup" style={{display: this.display ? "flex" : "none"}}>
                            <input class="FormControl" 
                                placeholder={app.translator.trans(`hpuswl-auth-phone.forum.modals.link.code`)}
                                oninput={e => this.code = e.target.value}
                                value={this.code}
                            />
                            <Button 
                                className="Button" 
                                disabled={this.countdown > 0 || this.loading}
                                onclick={() => this.sendSMS(this.phone, this.region)}
                            >
                                {this.countdown > 0 
                                    ? `${this.countdown}s` 
                                    : app.translator.trans(`hpuswl-auth-phone.forum.buttons.send`)}
                            </Button>
                        </div>

                        {!this.display && (
                            <Button 
                                className="Button Button--primary LogInButton--SMSAuth" 
                                loading={this.loading} 
                                disabled={this.loading}
                                onclick={() => this.sendSMS(this.phone, this.region)}
                            >
                                {app.translator.trans(`hpuswl-auth-phone.forum.buttons.send`)}
                            </Button>
                        )}

                        {this.display && (
                            <Button 
                                className="Button Button--primary LogInButton--SMSAuth"
                                onclick={() => this.submit(this.phone, this.code, this.region)}
                                loading={this.loading}
                            >
                                {app.translator.trans(`hpuswl-auth-phone.forum.buttons.submit`)}
                            </Button>
                        )}
                        
                        {this.tips()}
                    </div>
                </div>
            </div>
        );
    }

    tips(){
        if(app.forum.data.attributes.hpuswlAuthPhoneTips){
            return (
                <div className="phone-tips" style={{display:this.displaySend}}>
                    {app.translator.trans(`hpuswl-auth-phone.forum.tips.title`)}
                    <div className="m-t-10">
                        {
                            app.forum.data.attributes.hpuswlAuthPhoneTipsOneTitle?
                            <Link style="color:var(--control-color);" href={app.forum.data.attributes.hpuswlAuthPhoneTipsOneUrl} 
                            external={true} target="_blank">《{app.forum.data.attributes.hpuswlAuthPhoneTipsOneTitle}》
                            </Link>:""
                        }
                        {
                            app.forum.data.attributes.hpuswlAuthPhoneTipsTwoTitle?
                            <Link style="color:var(--control-color);" href={app.forum.data.attributes.hpuswlAuthPhoneTipsTwoUrl} 
                            external={true} target="_blank">《{app.forum.data.attributes.hpuswlAuthPhoneTipsTwoTitle}》
                            </Link>:""
                        }
                        {
                            app.forum.data.attributes.hpuswlAuthPhoneTipsThreeTitle?
                            <Link style="color:var(--control-color);" href={app.forum.data.attributes.hpuswlAuthPhoneTipsThreeUrl} 
                            external={true} target="_blank">《{app.forum.data.attributes.hpuswlAuthPhoneTipsThreeTitle}》
                            </Link>:""
                        }
                    </div>
                </div>
            )
        }
    }

    startCountdown() {
        this.countdown = 60;
        const interval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(interval);
            }
            m.redraw();
        }, 1000);
    }

    sendSMS(phone,region) {
        var t = typeof phone;
        if(t != 'string'){
            return;
        }
        this.loading = true;
        this.inputDisabled = true;
        if(phone.length==0){
            this.loading = false;
            this.inputDisabled = false;
            const alert = app.alerts.show({ type: 'error' }, 
                app.translator.trans(`hpuswl-auth-phone.forum.alerts.wrong_num`)
            );
            setTimeout(() => app.alerts.dismiss(alert), 5000);
            return;
        }
        if(region=="ChineseMainland" && phone.length!=11){
            this.loading = false;
            this.inputDisabled = false;
            const alert = app.alerts.show({ type: 'error' }, 
                app.translator.trans(`hpuswl-auth-phone.forum.alerts.wrong_num`)
            );
            setTimeout(() => app.alerts.dismiss(alert), 5000);
            return;
        }
        app
            .request({
                url: app.forum.attribute('apiUrl') + "/auth/sms" + '/send',
                method: 'POST',
                body: { phone, region },
                errorHandler: this.onerror.bind(this),
            }).catch((error) => {
                this.inputDisabled = false;
                const alert = app.alerts.show(
                Alert,
                { type: 'error' },
                error
                );
                setTimeout(() => app.alerts.dismiss(alert), 5000);
                return;
            }).then((result) => {
                this.loading = false;

                if(!result.status){
                    this.inputDisabled = false;
                    let alert;
                    switch(result.msg){
                        case "code_exist":
                            this.display = true;
                            this.displaySend = "none";
                            this.inputDisabled = true;
                            this.countdown = result.time * 60;
                            this.startCountdown();
                            alert = app.alerts.show({ type: 'error' }, app.translator.trans(`hpuswl-auth-phone.forum.alerts.code_exist`,{
                                time: result.time
                            }));
                            break;
                        case "phone_exist":
                            alert = app.alerts.show({ type: 'error' }, app.translator.trans(`hpuswl-auth-phone.forum.alerts.phone_exist`));
                            break;
                        default:
                            alert = app.alerts.show({ type: 'error' }, result.msg);
                            break;
                    }
                    if (alert) setTimeout(() => app.alerts.dismiss(alert), 5000);
                    return;
                }

                this.display = true;
                this.inputDisabled = true;
                this.displaySend = "none";
                this.startCountdown();
                const alert = app.alerts.show({ type: 'success' }, app.translator.trans(`hpuswl-auth-phone.forum.alerts.send_success`));
                setTimeout(() => app.alerts.dismiss(alert), 5000);
            });
    }

    submit(phone,code,region){
        if(!phone || !code){
            return;
        }
        this.loading = true;
        const user = app.session.user;
        user
          .save({
            phone: phone,
            code: code,
            region:region
          })
          .then((res) => {
                this.loading = false;
                if(res){
                    this.hide();
                    app.alerts.show({ type: 'success' }, app.translator.trans(`hpuswl-auth-phone.forum.alerts.link_success`));
                    setTimeout(() => window.location.reload(), 500);
                }
          })
          .catch((error) => {
                this.loading = false;
                m.redraw();
            });
    }
}
