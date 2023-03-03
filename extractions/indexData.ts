import FirstOrderValueIndexer from '../src/controllers/FirstOrderValueIndexer';
import OpenAIController from '../src/controllers/OpenAIController';
import instructions from './instructions';

export async function indexData() {
  const openAIController = new OpenAIController();

  const indexer = new FirstOrderValueIndexer(
    '../../sampleData/COINBASE_10_Q',
    '',
    instructions,
    openAIController
  );
  await indexer.beginIndexing();
}

indexData()
  .then((_) => {
    console.log('Successfully indexed data');
  })
  .catch((err) => {
    console.log('Error thrown while indexing data: ', err);
  });
