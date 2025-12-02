import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  styled,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconUpload, IconFileSpreadsheet, IconX, IconCheck, IconClock } from '@tabler/icons-react';
import planilhaService from '../../services/planilhaService';

const DropZone = styled(Box)(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : hasFile ? theme.palette.success.main : theme.palette.divider}`,
  borderRadius: '12px',
  padding: '40px 30px',
  textAlign: 'center',
  backgroundColor: isDragActive
    ? `${theme.palette.primary.main}10`
    : hasFile
      ? `${theme.palette.success.main}10`
      : theme.palette.background.default,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  marginTop: '16px',
}));

const UploadPlanilha = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estado da tabela de planilhas
  const [planilhas, setPlanilhas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalElements, setTotalElements] = useState(0);

  // Estado de feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const acceptedFormats = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];

  const acceptedExtensions = ['.xlsx', '.xls', '.csv'];

  // Buscar planilhas do backend
  const fetchPlanilhas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await planilhaService.listar(page, rowsPerPage);
      setPlanilhas(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Erro ao buscar planilhas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar histórico de planilhas.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchPlanilhas();
  }, [fetchPlanilhas]);

  const validateFile = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return acceptedFormats.includes(file.type) || acceptedExtensions.includes(extension);
  };

  const handleFile = useCallback((file) => {
    if (validateFile(file)) {
      setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Formato de arquivo não suportado. Use .xlsx, .xls ou .csv',
        severity: 'error',
      });
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simular progresso (já que fetch não suporta progress nativamente)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await planilhaService.importar(selectedFile.file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setSnackbar({
        open: true,
        message: response.message || 'Planilha importada com sucesso!',
        severity: 'success',
      });

      // Limpar arquivo selecionado e recarregar lista
      setSelectedFile(null);
      setPage(0);
      fetchPlanilhas();
    } catch (error) {
      console.error('Erro ao importar planilha:', error);
      clearInterval(progressInterval);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao importar planilha. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <PageContainer title="Upload Planilha" description="Faça upload de planilhas Excel">
      {/* Área de Upload */}
      <DashboardCard title="Upload de Planilha">
        <Box>
          <HiddenInput
            type="file"
            id="file-upload"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            disabled={uploading}
          />

          <label htmlFor="file-upload">
            <DropZone
              isDragActive={isDragActive}
              hasFile={!!selectedFile}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{ pointerEvents: uploading ? 'none' : 'auto' }}
            >
              <IconWrapper>
                <IconUpload size={32} color="#5D87FF" />
              </IconWrapper>

              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte sua planilha aqui'}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                ou clique para selecionar
              </Typography>

              <Typography variant="caption" color="textSecondary">
                Formatos aceitos: .xlsx, .xls, .csv
              </Typography>
            </DropZone>
          </label>

          {selectedFile && (
            <FilePreview>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconFileSpreadsheet size={32} color="#5D87FF" />
                <Box>
                  <Typography variant="subtitle2">{selectedFile.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconCheck size={20} color="#4caf50" />
                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  sx={{ color: 'error.main' }}
                  disabled={uploading}
                >
                  <IconX size={20} />
                </IconButton>
              </Box>
            </FilePreview>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Enviando... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {selectedFile && !uploading && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconUpload size={18} />}
                onClick={handleUpload}
              >
                Enviar Planilha
              </Button>
            </Box>
          )}
        </Box>
      </DashboardCard>

      {/* Tabela de Planilhas */}
      <Box sx={{ mt: 3 }}>
        <DashboardCard title="Histórico de Planilhas">
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table
                  aria-label="tabela de planilhas"
                  sx={{
                    whiteSpace: 'nowrap',
                    mt: 2,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Nome do Arquivo
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Adicionada Por
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Status
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {planilhas.length > 0 ? (
                      planilhas.map((planilha, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconFileSpreadsheet size={20} color="#5D87FF" />
                              <Typography variant="subtitle2" fontWeight={400}>
                                {planilha.nomeArquivo}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {planilha.adicionadaPor}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {planilha.processamentoConcluido ? (
                              <Chip
                                icon={<IconCheck size={16} />}
                                label="Concluído"
                                size="small"
                                color="success"
                              />
                            ) : (
                              <Chip
                                icon={<IconClock size={16} />}
                                label="Processando"
                                size="small"
                                color="warning"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography color="textSecondary" sx={{ py: 3 }}>
                            Nenhuma planilha encontrada
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  count={totalElements}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage="Linhas por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                />
              </>
            )}
          </Box>
        </DashboardCard>
      </Box>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default UploadPlanilha;
