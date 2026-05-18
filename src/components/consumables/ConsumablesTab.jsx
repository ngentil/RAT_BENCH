import StockItemTab from '../workshop/StockItemTab';
export default function ConsumablesTab(props) {
  return <StockItemTab {...props} tableType="consumable" label="Consumables" />;
}
