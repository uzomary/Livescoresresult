import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';

const AppLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default AppLayout;
