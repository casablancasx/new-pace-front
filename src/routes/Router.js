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
const EscalarPautista = lazy(() => import("../pages/escala/EscalarPautista"));
const EscalarAvaliador = lazy(() => import("../pages/escala/EscalarAvaliador"));
const Pautas = lazy(() => import("../pages/pautas/Pautas"));
const DetalhesPauta = lazy(() => import("../pages/pautas/DetalhesPauta"));
const Audiencias = lazy(() => import("../pages/audiencias/Audiencias"));
const AdvogadosPrioritarios = lazy(() => import("../pages/audiencias/AdvogadosPrioritarios"));
const Avaliadores = lazy(() => import("../pages/equipe/Avaliadores"));

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
        element: <ProtectedRoute allowedRoles={['ADMIN']}><UploadPlanilha /></ProtectedRoute> 
      },
      { 
        path: '/equipe/avaliadores', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN']}><Avaliadores /></ProtectedRoute> 
      },
      { 
        path: '/escala/pautista', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN']}><EscalarPautista /></ProtectedRoute> 
      },
      { 
        path: '/escala/avaliador', 
        exact: true, 
        element: <ProtectedRoute allowedRoles={['ADMIN']}><EscalarAvaliador /></ProtectedRoute> 
      },
      { path: '/pautas', exact: true, element: <Pautas /> },
      { path: '/pautas/:id', exact: true, element: <DetalhesPauta /> },
      { path: '/audiencias', exact: true, element: <Audiencias /> },
      { path: '/advogados-prioritarios', exact: true, element: <AdvogadosPrioritarios /> },
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
