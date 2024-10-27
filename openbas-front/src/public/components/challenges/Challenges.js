import { useQueryParameter } from '../../../utils/Environment';
import ChallengesPlayer from './ChallengesPlayer';
import ChallengesPreview from './ChallengesPreview';

const Challenges = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <ChallengesPreview />;
  }
  return <ChallengesPlayer />;
};

export default Challenges;
