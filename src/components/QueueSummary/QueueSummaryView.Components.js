import styled from 'react-emotion';

export const QueueSummaryTableContainer = styled('div')`
  border-style: solid;
  border-width: 0 0 1px 0;
  /* min-height: 68px; */
  overflow-y: auto;
  width: 100%;
  font-weight: bold;
  ${(props) => props.theme.TaskList.Filter.Container}
`;

