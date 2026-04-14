import app from 'flarum/admin/app';
import { settings } from '@fof-components';
import ExtensionPage from 'flarum/components/ExtensionPage';

const {
    items: { StringItem, SelectItem },
} = settings;

export default class SettingsPage extends ExtensionPage {
    oninit(vnode) {
        super.oninit(vnode);
        this.setting = this.setting.bind(this);
    }
    content() {
        let provider = this.setting('hpuswl-auth-phone.api_sms_provider')() || this.setting('hpuswl-auth-phone.sms_provider')();

        if (!provider) {
            provider = 'aliyun';
            this.setting('hpuswl-auth-phone.api_sms_provider')('aliyun');
        }

        return [
            <div className="SMSSettingsPage">
                <div className="container">
                    <div className="Form-group">
                        <SelectItem
                            name="hpuswl-auth-phone.api_sms_provider"
                            setting={this.setting}
                            options={{
                                aliyun: app.translator.trans('hpuswl-auth-phone.admin.settings.aliyun'),
                                tencent: app.translator.trans('hpuswl-auth-phone.admin.settings.tencent'),
                                huawei: app.translator.trans('hpuswl-auth-phone.admin.settings.huawei'),
                                qiniu: app.translator.trans('hpuswl-auth-phone.admin.settings.qiniu'),
                            }}
                            label={app.translator.trans('hpuswl-auth-phone.admin.settings.provider')}
                        />
                    </div>

                    <div className="Form-group">
                        {this.buildSettingComponent({
                            type: 'boolean',
                            setting: 'hpuswl-auth-phone.support_traditional',
                            label: app.translator.trans(`hpuswl-auth-phone.admin.settings.support_traditional`),
                        })}
                    </div>

                    {provider === 'aliyun' && [
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_access_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_access_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_access_sec" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_access_sec')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_sign" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_sign')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_template_code" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_template_code')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_template_code_traditional" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_template_code_traditional')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_ali_expire_second" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_expire_second')}
                            </StringItem>
                        </div>
                    ]}

                    {provider === 'tencent' && [
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_secret_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_secret_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_secret_key" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_secret_key')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_region" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_region')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_app_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_app_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_sign_name" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_sign_name')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_template_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_template_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_template_id_traditional" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_template_id_traditional')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_tencent_expire_second" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_expire_second')}
                            </StringItem>
                        </div>
                    ]}

                    {provider === 'huawei' && [
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_app_key" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_app_key')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_app_secret" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_app_secret')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_endpoint" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_endpoint')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_sender" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_sender')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_signature" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_signature')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_template_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_template_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_template_id_traditional" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_template_id_traditional')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_huawei_expire_second" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_expire_second')}
                            </StringItem>
                        </div>
                    ]}

                    {provider === 'qiniu' && [
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_access_key" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_access_key')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_secret_key" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_secret_key')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_signature" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_signature')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_template_id" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_template_id')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_template_id_traditional" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_template_id_traditional')}
                            </StringItem>
                        </div>,
                        <div className="Form-group">
                            <StringItem name="hpuswl-auth-phone.api_sms_qiniu_expire_second" setting={this.setting}>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_expire_second')}
                            </StringItem>
                        </div>
                    ]}
                    <hr></hr>
                    {this.buildSettingComponent({
                        type: 'boolean',
                        setting: 'hpuswlAuthPhoneTips',
                        label: app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_switch`),
                    })}
                    
                    <div className="tips">
                        {this.buildSettingComponent({
                            className:"phone-tips-content",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsOneTitle',
                            placeholder: "#1 "+app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_title`),
                        })}
                        {this.buildSettingComponent({
                            className:"phone-tips-content ml-20",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsOneUrl',
                            placeholder: app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_url`),
                        })}
                        <br/><br/>
                        {this.buildSettingComponent({
                            className:"phone-tips-content",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsTwoTitle',
                            placeholder: "#2 "+app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_title`),
                        })}
                        {this.buildSettingComponent({
                            className:"phone-tips-content ml-20",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsTwoUrl',
                            placeholder: app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_url`),
                        })}
                        <br/><br/>
                        {this.buildSettingComponent({
                            className:"phone-tips-content",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsThreeTitle',
                            placeholder: "#3 "+app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_title`),
                        })}
                        {this.buildSettingComponent({
                            className:"phone-tips-content ml-20",
                            type: 'string',
                            setting: 'hpuswlAuthPhoneTipsThreeUrl',
                            placeholder: app.translator.trans(`hpuswl-auth-phone.admin.settings.tips_url`),
                        })}
                    </div>

                    <br/><br/><br/>
                    {this.submitButton()}
                </div>
            </div>
        ]
    }
}
