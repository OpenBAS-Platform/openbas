import React, { useState } from 'react';
import { IconButton, Popover, Step, StepLabel, Stepper, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { ExecutionTreeNode } from '../../../utils/api-types';

interface Props {
  findingId: string;
  findingValue: string;
}

export const FindingExecutionTree: React.FC<Props> = ({ findingId, findingValue }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [steps, setSteps] = useState<ExecutionTreeNode[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);

    fetch(`/api/findings/${findingId}/execution-tree`)
      .then(res => res.json())
      .then((data: ExecutionTreeNode) => {
        const flat = flattenExecutionTree(data);
        setSteps(flat);
      });
  };

  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <span
        onClick={handleClick}
        style={{ cursor: 'pointer', color: '#1976d2', display: 'inline-flex', alignItems: 'center' }}
      >{findingValue}
      </span>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div style={{ padding: 16, minWidth: 400, minHeight: 200 }}>
          <Stepper orientation="vertical" >
            {steps.map((step, index) => (
              <Step key={index} active>
                <StepLabel>
                  <Typography variant="body2">
                    <strong>{step.injectTitle}</strong><br/>
                    Execution: <strong>{step.executionId}</strong><br/>
                    {step.argumentKey && step.argumentValue
                      ? `${step.argumentKey}: ${step.argumentValue}`
                      : `Finding:  ${findingValue}`}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      </Popover>
    </>
  );
};

// utils.ts
export function flattenExecutionTree(node: ExecutionTreeNode): ExecutionTreeNode[] {
  const path: ExecutionTreeNode[] = [];

  const dfs = (n: ExecutionTreeNode | null) => {
    if (!n) return;
    if (n.parents && n.parents.length > 0) {
      dfs(n.parents[0]);
    }
    path.push(n);
  };

  dfs(node);
  return path;
}

export default FindingExecutionTree;