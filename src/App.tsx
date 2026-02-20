import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DatasetUploadSkeleton } from './pages/DatasetUpload/DatasetUpload.skeleton';
import { DatasetListSkeleton } from './pages/DatasetList/DatasetList.skeleton';

const DatasetList = lazy(() => import('./pages/DatasetList/DatasetList').then((m) => ({ default: m.DatasetList })));
const DatasetDetail = lazy(() => import('./pages/DatasetDetail/DatasetDetail').then((m) => ({ default: m.DatasetDetail })));
const DatasetUpload = lazy(() => import('./pages/DatasetUpload/DatasetUpload').then((m) => ({ default: m.DatasetUpload })));
const DatasetUpdate = lazy(() => import('./pages/DatasetUpdate/DatasetUpdate').then((m) => ({ default: m.DatasetUpdate })));

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<DatasetUploadSkeleton />}>
                  <DatasetUpload />
                </Suspense>
              }
            />
            <Route
              path="chart/:id"
              element={
                <Suspense fallback={null}>
                  <DatasetDetail />
                </Suspense>
              }
            />
            <Route
              path="dataset/:id/edit"
              element={
                <Suspense fallback={null}>
                  <DatasetUpdate />
                </Suspense>
              }
            />
            <Route
              path="datasets"
              element={
                <Suspense fallback={<DatasetListSkeleton />}>
                  <DatasetList />
                </Suspense>
              }
            />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
