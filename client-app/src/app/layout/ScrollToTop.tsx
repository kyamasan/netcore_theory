import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

const ScrollToTop = ({ children, location: { pathName } }: any) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathName]);

  return children;
};

export default withRouter(ScrollToTop);
