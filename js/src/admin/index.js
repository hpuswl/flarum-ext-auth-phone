import app from 'flarum/admin/app';
import SettingsPage from './components/SettingsPage';
import UserListPage from './components/UserList'

app.initializers.add('hpuswl/flarum-ext-auth-phone', () => {
  app.extensionData.for("hpuswl-auth-phone").registerPage(SettingsPage);
  UserListPage();
});
