import { useQueryParameter } from '../../../utils/Environment';
import ChallengesPreview from './ChallengesPreview';
import ChallengesPlayer from './ChallengesPlayer';

const Challenges = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <ChallengesPreview />;
  }
  return <ChallengesPlayer />;
};

export default Challenges;
