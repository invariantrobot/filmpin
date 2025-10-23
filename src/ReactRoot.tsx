import { Dashboard } from './dashboardPresenter.tsx';
import { Profile } from './profilePresenter.tsx';
import { Plan } from './planPresenter.tsx';
import { SearchPresenter } from './searchPresenter.tsx';
import { LayoutView } from './views/layoutView.tsx';

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
      <RouterProvider router={makeRouter({ model })} />
    </div>
  );
});

export { ReactRoot };

function makeRouter({ model }: ReactRootProps) {
  return createHashRouter([
    {
      path: '/',
      element: <LayoutView />,
      children: [
        {
          index: true,
          element: <Dashboard model={model} />,
        },
        {
          path: 'search',
          element: <SearchPresenter />,
        },
        {
          path: 'plan',
          element: <Plan model={model} />,
        },
        {
          path: 'profile',
          element: <Profile model={model} />,
        },
      ],
    },
  ]);
}
