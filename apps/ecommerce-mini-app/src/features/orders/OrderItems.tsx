import type { OrderLine } from '../../data';
import { money } from '../../shop';

export const OrderItems = ({ lines }: { lines: readonly OrderLine[] }) => (
  <ul className="order-items">
    {lines.map((line) => (
      <li key={line.productId}>
        <span>
          {line.name}
          <small>
            {line.quantity} шт., {line.weight}
          </small>
        </span>
        <span>{money(line.price * line.quantity)}</span>
      </li>
    ))}
  </ul>
);
