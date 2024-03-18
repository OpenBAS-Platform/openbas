import filterableProperties from '../../actions/schema/schema-action';

const useFilterableProperties = (clazz: string) => {
  return filterableProperties(clazz);
};

export default useFilterableProperties;
