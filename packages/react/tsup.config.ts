import { sorobanDevTsup } from '../../tsup.base';

export default sorobanDevTsup({
  external: ['react', 'react-dom', '@tanstack/react-query'],
});
