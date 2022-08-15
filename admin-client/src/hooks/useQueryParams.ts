export type QueryParams = {
  [key: string]: string;
};

function useQueryParams() {
  const search = window.location.search.split('&');
  const queryParams: QueryParams = search.reduce((prev, next) => {
    const keyValue = next.split('=');
    return { ...prev, [keyValue[0].replace('?', '')]: keyValue[1] };
  }, {});

  return queryParams;
}

export default useQueryParams;
