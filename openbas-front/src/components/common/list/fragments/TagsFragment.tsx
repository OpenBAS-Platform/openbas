import ItemTags from '../../../ItemTags';

type Props = { tags?: string[] };

const TagsFragment = (props: Props) => {
  return (<ItemTags variant="list" tags={props.tags ?? []} />);
};

export default TagsFragment;
