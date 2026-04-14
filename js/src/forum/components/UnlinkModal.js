import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class UnlinkModal extends Modal {
    className() {
        return `SMSAuthUnlinkModal Modal--small`;
    }

    title() {
        return app.translator.trans(`hpuswl-auth-phone.forum.modals.unlink.title`);
    }

    content() {
        return (
            <div className="Modal-body">
                <div className="Form Form--centered">
                    <p>{app.translator.trans(`hpuswl-auth-phone.forum.modals.unlink.no_providers`)}</p>
                    <div className="Form-group">
                        <Button
                            className="Button Button--primary Button--block"
                            type="submit"
                            loading={this.loading}
                        >
                            {app.translator.trans(`hpuswl-auth-phone.forum.modals.unlink.confirm`)}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    onsubmit(e) {

        let alert;

        e.preventDefault();
        this.loading = true;
        const user = app.session.user;
        user
          .save({
            phone: "",
          })
          .catch((error) => {
                const alert = app.alerts.show(
                Alert,
                { type: 'error' },
                error
                );
                setTimeout(() => app.alerts.dismiss(alert), 5000);
            })
          .then(() => {
                this.hide();
                m.redraw();
                const alert = app.alerts.show({ type: 'success' }, app.translator.trans(`hpuswl-auth-phone.forum.alerts.unlink_success`));
                setTimeout(() => {
                    app.alerts.dismiss(alert);
                    window.location.reload();
                }, 3000);
          });
    }
}
