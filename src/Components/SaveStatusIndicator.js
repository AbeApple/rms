import React, { useEffect, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * SaveStatusIndicator
 * Props:
 * - saving: boolean
 * - error: string | null
 *
 * Behavior:
 * - When saving is true: show grey spinner
 * - When saving transitions from true -> false without error: show green check for 3 seconds
 * - When error is set: show red X, with tooltip of the error on hover
 */
// Props:
// - loading: boolean (e.g., initial data fetch)
// - saving: boolean (an update/create is in progress)
// - error: string | null (last error message)
export default function SaveStatusIndicator({ loading = false, saving = false, error = null }) {
  const [showCheck, setShowCheck] = useState(false);
  const prevSavingRef = useRef(false);
  const timerRef = useRef();

  useEffect(() => {
    const prevSaving = prevSavingRef.current;

    // On transition from saving true -> false and no error, show check
    if (prevSaving && !saving && !error && !loading) {
      setShowCheck(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowCheck(false), 3000);
    }

    // If error occurs, hide check
    if (error) {
      setShowCheck(false);
      clearTimeout(timerRef.current);
    }

    prevSavingRef.current = saving;

    return () => clearTimeout(timerRef.current);
  }, [saving, error, loading]);

  const wrapperStyle = { position: 'absolute', top: 8, right: 8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div style={wrapperStyle}>
      {loading || saving ? (
        <CircularProgress size={24} sx={{ color: '#9e9e9e' }} />
      ) : error ? (
        <Tooltip title={error} arrow>
          <ErrorOutlineIcon sx={{ color: '#e53935', width: 24, height: 24 }} />
        </Tooltip>
      ) : showCheck ? (
        <CheckCircleOutlineIcon sx={{ color: '#43a047', width: 24, height: 24 }} />
      ) : null}
    </div>
  );
}
