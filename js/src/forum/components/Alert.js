
import app from 'flarum/forum/app';
import listItems from 'flarum/common/helpers/listItems';
import LinkModal from './LinkModal';
import Button from 'flarum/common/components/Button';
export default class UpdateAlert {
  HideAlert() {
    const user = app.session.user;
    if(!user){
      return true;
    }
    const smsAuth = user.attribute('SMSAuth');
    return smsAuth && smsAuth.isAuth;
  }

  view(){
    if (this.HideAlert()) {
      return m('div');
    }

    const controls = [
      Button.component(
        {
          className: 'Button Button--link',
          onclick: () => {
            app.modal.show(LinkModal);
          },
        },
        app.translator.trans('hpuswl-auth-phone.forum.alerts.toLink')
      ),
    ];
    const dismissControl = [];
    return m(
        '.Alert.Alert-info',
        m('.container', [
          m(
            'span.Alert-body', app.translator.trans(`hpuswl-auth-phone.forum.alerts.limit`)
          ),
          m('ul.Alert-controls',  listItems(controls.concat(dismissControl))),
        ])
    );
  }
    
}
