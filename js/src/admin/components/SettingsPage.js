import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/components/ExtensionPage';

export default class SettingsPage extends ExtensionPage {
    oninit(vnode) {
        super.oninit(vnode);
        this.setting = this.setting.bind(this);
        this.provider = this.setting('hpuswl-auth-phone.api_sms_provider')() || this.setting('hpuswl-auth-phone.sms_provider')() || 'aliyun';
        if (!this.setting('hpuswl-auth-phone.api_sms_provider')()) {
            this.setting('hpuswl-auth-phone.api_sms_provider')('aliyun');
        }
    }

    content() {
        const provider = this.provider;

        return (
            <div className="SMSSettingsPage">
                <div className="container">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <span className="icon fas fa-cog mr-2"></span>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.basic')}
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="Form-group">
                                <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.provider')}</label>
                                <div className="select">
                                    <select className="FormControl" value={provider} onchange={(e) => {
                                        this.provider = e.target.value;
                                        this.setting('hpuswl-auth-phone.api_sms_provider')(e.target.value);
                                    }}>
                                        <option value="aliyun">{app.translator.trans('hpuswl-auth-phone.admin.settings.aliyun')}</option>
                                        <option value="tencent">{app.translator.trans('hpuswl-auth-phone.admin.settings.tencent')}</option>
                                        <option value="huawei">{app.translator.trans('hpuswl-auth-phone.admin.settings.huawei')}</option>
                                        <option value="qiniu">{app.translator.trans('hpuswl-auth-phone.admin.settings.qiniu')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="Form-group">
                                <label className="checkbox">
                                    <input type="checkbox" checked={this.setting('hpuswl-auth-phone.support_traditional')() === '1'} onchange={(e) => {
                                        this.setting('hpuswl-auth-phone.support_traditional')(e.target.checked ? '1' : '0');
                                    }} />
                                    <span>{app.translator.trans('hpuswl-auth-phone.admin.settings.support_traditional')}</span>
                                </label>
                            </div>

                            <div className="Form-group">
                                <label className="checkbox">
                                    <input type="checkbox" checked={this.setting('hpuswl-auth-phone.enable_sms_login')() === '1'} onchange={(e) => {
                                        this.setting('hpuswl-auth-phone.enable_sms_login')(e.target.checked ? '1' : '0');
                                    }} />
                                    <span>{app.translator.trans('hpuswl-auth-phone.admin.settings.enable_sms_login')}</span>
                                </label>
                            </div>

                            <div className="Form-group">
                                <label className="checkbox">
                                    <input type="checkbox" checked={this.setting('hpuswl-auth-phone.enable_phone_verify')() === '1'} onchange={(e) => {
                                        this.setting('hpuswl-auth-phone.enable_phone_verify')(e.target.checked ? '1' : '0');
                                    }} />
                                    <span>{app.translator.trans('hpuswl-auth-phone.admin.settings.enable_phone_verify')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <span className="icon fas fa-cloud mr-2"></span>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.' + provider)}
                            </h3>
                        </div>
                        <div className="card-body">
                            {provider === 'aliyun' && [
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_access_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_ali_access_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_access_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_access_sec')}</label>
                                    <input className="FormControl" type="password" value={this.setting('hpuswl-auth-phone.api_sms_ali_access_sec')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_access_sec')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_sign')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_ali_sign')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_sign')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_template_code')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_ali_template_code')() || ''} oninput={(

e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_template_code')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_template_code_traditional')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_ali_template_code_traditional')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_template_code_traditional')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_ali_expire_second')}</label>
                                    <input className="FormControl" type="number" value={this.setting('hpuswl-auth-phone.api_sms_ali_expire_second')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_ali_expire_second')(e.target.value);
                                    }} />
                                </div>
                            ]}

                            {provider === 'tencent' && [
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_secret_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_secret_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_secret_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_secret_key')}</label>
                                    <input className="FormControl" type="password" value={this.setting('hpuswl-auth-phone.api_sms_tencent_secret_key')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_secret_key')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_region')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_region')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_region')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_app_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_app_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_app_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_sign_name')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_sign_name')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_sign_name')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_template_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_template_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_template_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_template_id_traditional')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_tencent_template_id_traditional')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_template_id_traditional')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_tencent_expire_second')}</label>
                                    <input className="FormControl" type="number" value={this.setting('hpuswl-auth-phone.api_sms_tencent_expire_second')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_tencent_expire_second')(e.target.value);
                                    }} />
                                </div>
                            ]}

                            {provider === 'huawei' && [
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_app_key')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_app_key')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_app_key')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_app_secret')}</label>
                                    <input className="FormControl" type="password" value={this.setting('hpuswl-auth-phone.api_sms_huawei_app_secret')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_app_secret')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_endpoint')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_endpoint')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_endpoint')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_sender')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_sender')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_sender')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_signature')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_signature')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_signature')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_template_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_template_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_template_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_template_id_traditional')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_huawei_template_id_traditional')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_template_id_traditional')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_huawei_expire_second')}</label>
                                    <input className="FormControl" type="number" value={this.setting('hpuswl-auth-phone.api_sms_huawei_expire_second')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_huawei_expire_second')(e.target.value);
                                    }} />
                                </div>
                            ]}

                            {provider === 'qiniu' && [
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_access_key')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_access_key')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_access_key')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_secret_key')}</label>
                                    <input className="FormControl" type="password" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_secret_key')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_secret_key')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_signature')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_signature')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_signature')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_template_id')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_template_id')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_template_id')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_template_id_traditional')}</label>
                                    <input className="FormControl" type="text" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_template_id_traditional')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_template_id_traditional')(e.target.value);
                                    }} />
                                </div>,
                                <div className="Form-group">
                                    <label className="label">{app.translator.trans('hpuswl-auth-phone.admin.settings.api_sms_qiniu_expire_second')}</label>
                                    <input className="FormControl" type="number" value={this.setting('hpuswl-auth-phone.api_sms_qiniu_expire_second')() || ''} oninput={(e) => {
                                        this.setting('hpuswl-auth-phone.api_sms_qiniu_expire_second')(e.target.value);
                                    }} />
                                </div>
                            ]}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <span className="icon fas fa-globe mr-2"></span>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.region_settings')}
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="Form-group">
                                <label className="checkbox">
                                    <input type="checkbox" checked={this.setting('hpuswlAuthPhonePostChineseLand')() === '1'} onchange={(e) => {
                                        this.setting('hpuswlAuthPhonePostChineseLand')(e.target.checked ? '1' : '0');
                                    }} />
                                    <span>{app.translator.trans('hpuswl-auth-phone.admin.settings.tips_Chinese_land')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <span className="icon fas fa-info-circle mr-2"></span>
                                {app.translator.trans('hpuswl-auth-phone.admin.settings.tips_settings')}
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="Form-group">
                                <label className="checkbox">
                                    <input type="checkbox" checked={this.setting('hpuswlAuthPhoneTips')() === '1'} onchange={(e) => {
                                        this.setting('hpuswlAuthPhoneTips')(e.target.checked ? '1' : '0');
                                    }} />
                                    <span>{app.translator.trans('hpuswl-auth-phone.admin.settings.tips_switch')}</span>
                                </label>
                            </div>

                            <div className="tips-container">
                                <div className="tips-row">
                                    <input className="FormControl tips-input" type="text" placeholder={'#1 ' + app.translator.trans('hpuswl-auth-phone.admin.settings.tips_title')} value={this.setting('hpuswlAuthPhoneTipsOneTitle')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsOneTitle')(e.target.value);
                                    }} />
                                    <input className="FormControl tips-input ml-2" type="text" placeholder={app.translator.trans('hpuswl-auth-phone.admin.settings.tips_url')} value={this.setting('hpuswlAuthPhoneTipsOneUrl')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsOneUrl')(e.target.value);
                                    }} />
                                </div>
                                <div className="tips-row">
                                    <input className="FormControl tips-input" type="text" placeholder={'#2 ' + app.translator.trans('hpuswl-auth-phone.admin.settings.tips_title')} value={this.setting('hpuswlAuthPhoneTipsTwoTitle')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsTwoTitle')(e.target.value);
                                    }} />
                                    <input className="FormControl tips-input ml-2" type="text" placeholder={app.translator.trans('hpuswl-auth-phone.admin.settings.tips_url')} value={this.setting('hpuswlAuthPhoneTipsTwoUrl')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsTwoUrl')(e.target.value);
                                    }} />
                                </div>
                                <div className="tips-row">
                                    <input className="FormControl tips-input" type="text" placeholder={'#3 ' + app.translator.trans('hpuswl-auth-phone.admin.settings.tips_title')} value={this.setting('hpuswlAuthPhoneTipsThreeTitle')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsThreeTitle')(e.target.value);
                                    }} />
                                    <input className="FormControl tips-input ml-2" type="text" placeholder={app.translator.trans('hpuswl-auth-phone.admin.settings.tips_url')} value={this.setting('hpuswlAuthPhoneTipsThreeUrl')() || ''} oninput={(e) => {
                                        this.setting('hpuswlAuthPhoneTipsThreeUrl')(e.target.value);
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="Form-group submit-group">
                        {this.submitButton()}
                    </div>
                </div>
            </div>
        );
    }
}