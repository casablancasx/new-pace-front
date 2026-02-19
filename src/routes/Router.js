import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from '../components/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));

/* ****Pages***** */
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'))
const SamplePage = lazy(() => import('../pages/sample-page/SamplePage'))
const Icons = lazy(() => import('../pages/icons/Icons'))
const TypographyPage = lazy(() => import('../pages/utilities/TypographyPage'))
const Shadow = lazy(() => import('../pages/utilities/Shadow'))
const Error = lazy(() => import('../pages/authentication/Error'));
const Register = lazy(() => import('../pages/authentication/Register'));
const Login = lazy(() => import('../pages/authentication/Login'));

const BasicTable = lazy(() => import("../pages/tables/BasicTable"));
const ExAutoComplete = lazy(() =>
  import("../pages/form-elements/ExAutoComplete")
);
const ExButton = lazy(() => import("../pages/form-elements/ExButton"));
const ExCheckbox = lazy(() => import("../pages/form-elements/ExCheckbox"));
const ExRadio = lazy(() => import("../pages/form-elements/ExRadio"));
const ExSlider = lazy(() => import("../pages/form-elements/ExSlider"));
const ExSwitch = lazy(() => import("../pages/form-elements/ExSwitch"));
const FormLayouts = lazy(() => import("../pages/form-layouts/FormLayouts"));
const UploadPlanilha = lazy(() => import("../pages/upload-planilha/UploadPlanilha"));
const EscalaForm = lazy(() => import("../pages/escala/EscalaForm"));
const Pautas = lazy(() => import("../pages/pautas/Pautas"));
const DetalhesPauta = lazy(() => import("../pages/pautas/DetalhesPauta"));
const Audiencias = lazy(() => import("../pages/audiencias/Audiencias"));
const Avaliadores = lazy(() => import("../pages/equipe/Avaliadores"));
const Pautistas = lazy(() => import("../pages/equipe/Pautistas"));
const Apoio = lazy(() => import("../pages/equipe/Apoio"));
const ControleUsuarios = lazy(() => import("../pages/usuarios/ControleUsuarios"));
const Relatorio = lazy(() => import("../pages/relatorio/Relatorio"));

const Router = [
  {
    path: '/',
    element: <ProtectedRoute><FullLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Navigate to="/pautas" /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
      { 
        path: '/upload-planilha', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><UploadPlanilha /></ProtectedRoute> 
      },
      { 
        path: '/equipe/avaliadores', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><Avaliadores /></ProtectedRoute> 
      },
      { 
        path: '/equipe/pautistas', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><Pautistas /></ProtectedRoute> 
      },
      { 
        path: '/equipe/apoio', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><Apoio /></ProtectedRoute> 
      },
      { 
        path: '/escala', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><EscalaForm /></ProtectedRoute> 
      },
      { path: '/pautas', exact: true, element: <Pautas /> },
      { path: '/pautas/:id', exact: true, element: <DetalhesPauta /> },
      { path: '/audiencias', exact: true, element: <Audiencias /> },
      { 
        path: '/relatorio', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'APOIO']}><Relatorio /></ProtectedRoute> 
      },
      { 
        path: '/usuarios', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN']}><ControleUsuarios /></ProtectedRoute> 
      },
      { path: '/sample-page', exact: true, element: <SamplePage /> },
      { path: '/icons', exact: true, element: <Icons /> },
      { path: '/ui/typography', exact: true, element: <TypographyPage /> },
      { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: "/tables/basic-table", element: <BasicTable /> },
      { path: "/form-layouts", element: <FormLayouts /> },
      { path: "/form-elements/autocomplete", element: <ExAutoComplete /> },
      { path: "/form-elements/button", element: <ExButton /> },
      { path: "/form-elements/checkbox", element: <ExCheckbox /> },
      { path: "/form-elements/radio", element: <ExRadio /> },
      { path: "/form-elements/slider", element: <ExSlider /> },
      { path: "/form-elements/switch", element: <ExSwitch /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
