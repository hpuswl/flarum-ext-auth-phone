import { extend } from 'flarum/common/extend';
import app from 'flarum/admin/app';
import UserListPage from 'flarum/admin/components/UserListPage';
import EditUserModal from 'flarum/common/components/EditUserModal';
import Select from 'flarum/common/components/Select';

//https://api.docs.flarum.org/js/v1.1.0/class/src/admin/components/userlistpage.tsx~userlistpage#instance-method-columns
//https://github.dev/FriendsOfFlarum/pages
//vendor/core/js/src/admin/UserListPage
export default function () {
    extend(UserListPage.prototype, 'columns', (columns) => {
        columns.add('phoneStatus', {
        name:"Phone",
        content:(user) => {
          const phone = user.attribute('phone');
          const region = user.attribute('phone_region');
          if (phone) {
            return <div>{region ? `+${region} ` : ''}{phone}</div>;
          }
          return <div></div>;
        },
      });
    });

    // 扩展编辑用户模态框
    extend(EditUserModal.prototype, 'oninit', function() {
        this.phone = this.attrs.user.attribute('phone') || '';
        const regionCode = this.attrs.user.attribute('phone_region') || '86';
        const regionMap = { '86': 'ChineseMainland', '852': 'HongKong', '853': 'Macao', '886': 'Taiwan' };
        this.region = regionMap[regionCode] || 'ChineseMainland';
    });

    extend(EditUserModal.prototype, 'fields', function(items) {
        items.add('phone', (
            <div className="Form-group">
                <label>{app.translator.trans('hpuswl-auth-phone.forum.modals.link.phone')}</label>
                <div className="SMSAuth-inputGroup" style="display: flex; gap: 10px;">
                    <Select
                        options={{ ChineseMainland: '86', HongKong: '852', Macao: "853", Taiwan: "886" }}
                        value={this.region}
                        onchange={(val) => this.region = val}
                    />
                    <input
                        className="FormControl"
                        placeholder={app.translator.trans('hpuswl-auth-phone.forum.modals.link.phone')}
                        value={this.phone}
                        oninput={(e) => this.phone = e.target.value}
                    />
                </div>
            </div>
        ), 15);
    });

    extend(EditUserModal.prototype, 'data', function(data) {
        data.phone = this.phone;
        data.region = this.region;
    });

    // 扩展添加用户 (SignUpModal 在后台也用于添加用户)
    // 我们尝试从 common 或 forum 获取，但在 admin 中可能需要特殊处理
    const SignUpModal = flarum.core.compat['forum/components/SignUpModal'];
    
    if (SignUpModal) {
        extend(SignUpModal.prototype, 'oninit', function() {
            this.phone = this.phone || "";
            this.region = this.region || "ChineseMainland";
        });

        extend(SignUpModal.prototype, 'fields', function(items) {
            const showRegion = app.forum.attribute('hpuswlAuthPhoneSupportTraditional');
            items.add('phone', (
                <div className="Form-group">
                    <label>{app.translator.trans('hpuswl-auth-phone.forum.modals.link.phone')}</label>
                    <div className="SMSAuth-inputGroup" style="display: flex; gap: 10px;">
                        {showRegion && (
                            <Select
                                options={{ ChineseMainland: '86', HongKong: '852', Macao: "853", Taiwan: "886" }}
                                value={this.region}
                                onchange={(val) => this.region = val}
                                disabled={this.loading}
                            />
                        )}
                        <input
                            className="FormControl"
                            name="phone"
                            type="text"
                            placeholder={app.translator.trans('hpuswl-auth-phone.forum.modals.link.phone')}
                            value={this.phone}
                            oninput={(e) => this.phone = e.target.value}
                            disabled={this.loading}
                        />
                    </div>
                </div>
            ), 15);
        });

        extend(SignUpModal.prototype, 'submitData', function(data) {
            data.phone = this.phone;
            data.region = this.region;
        });
    }
  }
