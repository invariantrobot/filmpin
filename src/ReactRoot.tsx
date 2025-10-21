import { Navbar } from './navbarPresenter.tsx';
import { Dashboard } from './dashboardPresenter.tsx';
// import { Profile } from './profilePresenter.js';
// import { Film } from "./filmPresenter.jsx";

import { observer } from 'mobx-react-lite';

import { SuspenseView } from './views/suspenseView.tsx';

import { createHashRouter, RouterProvider } from 'react-router-dom';

interface Model {
  ready: boolean | null;
  user?: unknown;
  searchParams: {
    q?: string;
    [key: string]: unknown;
  };
}

interface ReactRootProps {
  model: Model;
}

const ReactRoot = observer(function ReactRoot({ model }: ReactRootProps) {
  // Show loading only if explicitly waiting (ready is false)
  // If ready is null or true, show the app
  if (model.ready === false) {
    return <SuspenseView promise={Promise.resolve()} />;
  }

  // Ready to show the app
  // Main app mobile div container
  return (
    <div className="border-2 border-black rounded-lg h-screen max-w-lg mx-auto shadow-2xl bg-white">
      <Navbar model={model} />
      <RouterProvider router={makeRouter({ model })} />
    </div>
  );
});

export { ReactRoot };

function makeRouter({ model }: ReactRootProps) {
  return createHashRouter([
    {
      path: '/',
      element: <Dashboard model={model} />,
    },
    /*{
      path: '/profile',
      element: <Profile model={model} />,
    },*/
  ]);
}
