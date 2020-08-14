import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const LoadingComponent: React.FC<{
  inverted?: boolean;
  content?: string;
}> = ({ inverted = true, content }) => {
  return (
    <div>
      <Dimmer active inverted={inverted}>
        <Loader content={content} />
      </Dimmer>
    </div>
  );
};

export default LoadingComponent;
