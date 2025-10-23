import { observer } from 'mobx-react-lite';
import { PlanView } from './views/planView';

interface PlanProps {
  model: unknown;
}

const Plan = observer(function PlanRender(_props: PlanProps) {
  return (
    <div>
      <PlanView model={_props.model} />
    </div>
  );
});

export { Plan };
