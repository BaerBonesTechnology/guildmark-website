export function PulseDataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="gm-pulse-data">
      <summary>View chart data</summary>
      <div
        className="gm-pulse-scroll"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th scope="col" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) =>
                  j === 0 ? (
                    <th scope="row" key={j}>
                      {v}
                    </th>
                  ) : (
                    <td key={j}>{v}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
