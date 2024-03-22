// Fixme: move to common hook

const useEntityLink = (entity: string) => {
  switch (entity) {
    case 'Asset':
      return '/admin/assets/endpoints';
    case 'AssetGroup':
      return '/admin/assets/asset_groups';
    case 'User':
      return '/admin/teams/players';
    case 'Team':
      return '/admin/teams/teams';
    case 'Organization':
      return '/admin/teams/organizations';
    default:
      return ('');
  }
};

export default useEntityLink;
