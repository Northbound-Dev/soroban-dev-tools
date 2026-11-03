import { sorobanDevTsup } from '../../tsup.base';

export default sorobanDevTsup({
  entry: { index: 'src/index.ts', bin: 'src/bin.ts' },
});
