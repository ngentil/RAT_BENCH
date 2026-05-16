import StockItemTab from '../workshop/StockItemTab';
export default function PartsTab(props) {
  return <StockItemTab {...props} tableType="part" label="Parts" />;
}
