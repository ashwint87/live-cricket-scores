import NewsComponent from './NewsComponent';
import CustomNewsComponent from './CustomNewsComponent';
import { NewsProvider } from './../context/NewsContext';

const NewsWrapper = ({ query, max, useCustom }) => (
  <NewsProvider query={query} max={max}>
    {useCustom ? <CustomNewsComponent /> : <NewsComponent />}
  </NewsProvider>
);

export default NewsWrapper;
