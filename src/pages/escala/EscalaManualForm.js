import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  MenuItem,
  Fab,
} from '@mui/material';
import { IconCheck, IconX, IconPlayerPlay } from '@tabler/icons-react';
import audienciaService from '../../services/audienciaService';
import sapiensService from '../../services/sapiensService';
import avaliadorService from '../../services/avaliadorService';
import apoioService from '../../services/apoioService';
import pautistaService from '../../services/pautistaService';
import escalaService from '../../services/escalaService';

const tipoEscalaOptions = [
  { label: 'Avaliador', value: 'AVALIADOR' },
  { label: 'Apoio', value: 'APOIO' },
  { label: 'Pautista', value: 'PAUTISTA' },
];

const INITIAL_FORM = {
  audiencias: [],
  tipoEscala: '',
  usuario: null,
  especieTarefa: null,
  unidadeOrigem: null,
  setorOrigem: null,
  unidadeDestino: null,
  setorDestino: null,
};

const EscalaManualForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, loading: false, message: '', success: false });

  // ─── Audiências ────────────────────────────────────────────────────────────
  const [audienciaOptions, setAudienciaOptions] = useState([]);
  const [audienciaSearchTerm, setAudienciaSearchTerm] = useState('');
  const [audienciaLoading, setAudienciaLoading] = useState(false);

  // ─── Espécie Tarefa ────────────────────────────────────────────────────────
  const [especieTarefaOptions, setEspecieTarefaOptions] = useState([]);
  const [especieTarefaSearchTerm, setEspecieTarefaSearchTerm] = useState('');
  const [especieTarefaLoading, setEspecieTarefaLoading] = useState(false);

  // ─── Usuário ───────────────────────────────────────────────────────────────
  const [usuarioOptions, setUsuarioOptions] = useState([]);
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [usuarioLoading, setUsuarioLoading] = useState(false);

  // ─── Unidade Origem ────────────────────────────────────────────────────────
  const [unidadeOrigemOptions, setUnidadeOrigemOptions] = useState([]);
  const [unidadeOrigemSearchTerm, setUnidadeOrigemSearchTerm] = useState('');
  const [unidadeOrigemLoading, setUnidadeOrigemLoading] = useState(false);

  // ─── Setor Origem ──────────────────────────────────────────────────────────
  const [setorOrigemOptions, setSetorOrigemOptions] = useState([]);
  const [setorOrigemSearchTerm, setSetorOrigemSearchTerm] = useState('');
  const [setorOrigemLoading, setSetorOrigemLoading] = useState(false);

  // ─── Unidade Destino ───────────────────────────────────────────────────────
  const [unidadeDestinoOptions, setUnidadeDestinoOptions] = useState([]);
  const [unidadeDestinoSearchTerm, setUnidadeDestinoSearchTerm] = useState('');
  const [unidadeDestinoLoading, setUnidadeDestinoLoading] = useState(false);

  // ─── Setor Destino ─────────────────────────────────────────────────────────
  const [setorDestinoOptions, setSetorDestinoOptions] = useState([]);
  const [setorDestinoSearchTerm, setSetorDestinoSearchTerm] = useState('');
  const [setorDestinoLoading, setSetorDestinoLoading] = useState(false);

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Audiências: debounce 500ms, min 3 chars
  useEffect(() => {
    const buscar = async () => {
      if (audienciaSearchTerm.length < 3) {
        setAudienciaOptions([]);
        return;
      }
      setAudienciaLoading(true);
      try {
        const response = await audienciaService.listar(0, 20, null, audienciaSearchTerm, 'numeroProcesso', 'ASC');
        setAudienciaOptions(response?.content || []);
      } catch (err) {
        console.error('Erro ao buscar audiências:', err);
        setAudienciaOptions([]);
      } finally {
        setAudienciaLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [audienciaSearchTerm]);

  // Espécie tarefa: debounce 500ms, min 2 chars
  useEffect(() => {
    const buscar = async () => {
      if (especieTarefaSearchTerm.length < 2) {
        setEspecieTarefaOptions([]);
        return;
      }
      setEspecieTarefaLoading(true);
      try {
        const results = await sapiensService.buscarEspecieTarefa(especieTarefaSearchTerm);
        setEspecieTarefaOptions(results);
      } catch (err) {
        console.error('Erro ao buscar espécies de tarefa:', err);
        setEspecieTarefaOptions([]);
      } finally {
        setEspecieTarefaLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [especieTarefaSearchTerm]);

  // Usuários: debounce 300ms, depends on tipoEscala
  useEffect(() => {
    if (!formData.tipoEscala) return;
    const buscar = async () => {
      setUsuarioLoading(true);
      try {
        let results;
        if (formData.tipoEscala === 'AVALIADOR') results = await avaliadorService.buscar(usuarioSearchTerm);
        else if (formData.tipoEscala === 'PAUTISTA') results = await pautistaService.buscar(usuarioSearchTerm);
        else results = await apoioService.buscar(usuarioSearchTerm);
        setUsuarioOptions(results);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setUsuarioOptions([]);
      } finally {
        setUsuarioLoading(false);
      }
    };
    const id = setTimeout(buscar, 300);
    return () => clearTimeout(id);
  }, [usuarioSearchTerm, formData.tipoEscala]);

  // Carregar usuários ao trocar tipoEscala
  useEffect(() => {
    if (!formData.tipoEscala) {
      setUsuarioOptions([]);
      return;
    }
    setFormData((prev) => ({ ...prev, usuario: null }));
    setUsuarioSearchTerm('');
    const carregar = async () => {
      setUsuarioLoading(true);
      try {
        let results;
        if (formData.tipoEscala === 'AVALIADOR') results = await avaliadorService.buscar('');
        else if (formData.tipoEscala === 'PAUTISTA') results = await pautistaService.buscar('');
        else results = await apoioService.buscar('');
        setUsuarioOptions(results);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setUsuarioLoading(false);
      }
    };
    carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tipoEscala]);

  // Unidade Origem search
  useEffect(() => {
    const buscar = async () => {
      if (unidadeOrigemSearchTerm.length < 2) {
        setUnidadeOrigemOptions([]);
        return;
      }
      setUnidadeOrigemLoading(true);
      try {
        const results = await sapiensService.buscarUnidadePFPA(unidadeOrigemSearchTerm);
        setUnidadeOrigemOptions(results);
      } catch (err) {
        console.error('Erro ao buscar unidades origem:', err);
        setUnidadeOrigemOptions([]);
      } finally {
        setUnidadeOrigemLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [unidadeOrigemSearchTerm]);

  // Limpar setor origem quando unidade origem mudar
  useEffect(() => {
    setFormData((prev) => ({ ...prev, setorOrigem: null }));
    setSetorOrigemSearchTerm('');
    setSetorOrigemOptions([]);
  }, [formData.unidadeOrigem]);

  // Setor Origem search
  useEffect(() => {
    const buscar = async () => {
      if (setorOrigemSearchTerm.length < 2 || !formData.unidadeOrigem) {
        setSetorOrigemOptions([]);
        return;
      }
      setSetorOrigemLoading(true);
      try {
        const results = await sapiensService.buscarSetor(setorOrigemSearchTerm, formData.unidadeOrigem.id);
        setSetorOrigemOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setores origem:', err);
        setSetorOrigemOptions([]);
      } finally {
        setSetorOrigemLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [setorOrigemSearchTerm, formData.unidadeOrigem]);

  // Unidade Destino search
  useEffect(() => {
    const buscar = async () => {
      if (unidadeDestinoSearchTerm.length < 2) {
        setUnidadeDestinoOptions([]);
        return;
      }
      setUnidadeDestinoLoading(true);
      try {
        const results = await sapiensService.buscarUnidadePFPA(unidadeDestinoSearchTerm);
        setUnidadeDestinoOptions(results);
      } catch (err) {
        console.error('Erro ao buscar unidades destino:', err);
        setUnidadeDestinoOptions([]);
      } finally {
        setUnidadeDestinoLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [unidadeDestinoSearchTerm]);

  // Limpar setor destino quando unidade destino mudar
  useEffect(() => {
    setFormData((prev) => ({ ...prev, setorDestino: null }));
    setSetorDestinoSearchTerm('');
    setSetorDestinoOptions([]);
  }, [formData.unidadeDestino]);

  // Setor Destino search
  useEffect(() => {
    const buscar = async () => {
      if (setorDestinoSearchTerm.length < 2 || !formData.unidadeDestino) {
        setSetorDestinoOptions([]);
        return;
      }
      setSetorDestinoLoading(true);
      try {
        const results = await sapiensService.buscarSetor(setorDestinoSearchTerm, formData.unidadeDestino.id);
        setSetorDestinoOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setores destino:', err);
        setSetorDestinoOptions([]);
      } finally {
        setSetorDestinoLoading(false);
      }
    };
    const id = setTimeout(buscar, 500);
    return () => clearTimeout(id);
  }, [setorDestinoSearchTerm, formData.unidadeDestino]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCloseDialog = () => {
    setDialog({ open: false, loading: false, message: '', success: false });
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.audiencias || formData.audiencias.length === 0)
      errors.audiencias = 'Selecione pelo menos uma audiência';
    if (!formData.especieTarefa) errors.especieTarefa = 'Campo obrigatório';
    if (!formData.tipoEscala) errors.tipoEscala = 'Campo obrigatório';
    if (!formData.usuario) errors.usuario = 'Campo obrigatório';
    if (!formData.setorOrigem) errors.setorOrigem = 'Campo obrigatório';
    if (!formData.setorDestino) errors.setorDestino = 'Campo obrigatório';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setDialog({
        open: true,
        loading: false,
        message: 'Preencha todos os campos obrigatórios destacados em vermelho',
        success: false,
      });
      return;
    }

    setDialog({ open: true, loading: true, message: 'Processando escala manual...', success: false });
    setSubmitting(true);

    try {
      const payload = {
        audiencias: formData.audiencias.map((a) => a.id),
        usuarioId: formData.usuario.id,
        tipoEscala: formData.tipoEscala,
        setorOrigemId: formData.setorOrigem.id,
        setorDestinoId: formData.setorDestino.id,
        especieTarefa: {
          id: formData.especieTarefa.id,
          descricao: formData.especieTarefa.nome || formData.especieTarefa.descricao || null,
        },
      };

      const response = await escalaService.escalarManual(payload);
      setDialog({
        open: true,
        loading: false,
        message: response?.message || 'Escala manual realizada com sucesso!',
        success: true,
      });
    } catch (error) {
      console.error('Erro ao escalar manualmente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao processar escala manual';
      setDialog({ open: true, loading: false, message: errorMessage, success: false });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}
    >
      {/* Audiências - busca dinâmica por número de processo */}
      <Autocomplete
        multiple
        options={audienciaOptions}
        getOptionLabel={(option) => option.numeroProcesso || `Audiência #${option.id}`}
        value={formData.audiencias}
        loading={audienciaLoading}
        filterOptions={(x) => x}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, audiencias: newValue });
          if (newValue.length > 0) setFieldErrors((prev) => ({ ...prev, audiencias: undefined }));
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === 'input') setAudienciaSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterSelectedOptions
        noOptionsText={
          audienciaSearchTerm.length < 3
            ? 'Digite pelo menos 3 caracteres para buscar'
            : 'Nenhuma audiência encontrada'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Audiências *"
            variant="outlined"
            placeholder="Digite o número do processo..."
            error={!!fieldErrors.audiencias}
            helperText={fieldErrors.audiencias}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {audienciaLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Espécie Tarefa */}
      <Autocomplete
        options={especieTarefaOptions}
        getOptionLabel={(option) => option.nome || ''}
        value={formData.especieTarefa}
        loading={especieTarefaLoading}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, especieTarefa: newValue });
          if (newValue) setFieldErrors((prev) => ({ ...prev, especieTarefa: undefined }));
        }}
        onInputChange={(event, newInputValue) => {
          setEspecieTarefaSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          especieTarefaSearchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhuma espécie encontrada'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Espécie Tarefa *"
            variant="outlined"
            fullWidth
            placeholder="Digite para buscar..."
            error={!!fieldErrors.especieTarefa}
            helperText={fieldErrors.especieTarefa}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {especieTarefaLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Tipo de Escala */}
      <TextField
        select
        label="Tipo de Escala *"
        value={formData.tipoEscala}
        onChange={(e) => {
          setFormData({ ...formData, tipoEscala: e.target.value });
          if (e.target.value) setFieldErrors((prev) => ({ ...prev, tipoEscala: undefined }));
        }}
        variant="outlined"
        fullWidth
        error={!!fieldErrors.tipoEscala}
        helperText={fieldErrors.tipoEscala}
      >
        {tipoEscalaOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Usuário - aparece após selecionar tipo de escala */}
      {formData.tipoEscala && (
        <Autocomplete
          options={usuarioOptions}
          getOptionLabel={(option) => option.nome || ''}
          value={formData.usuario}
          loading={usuarioLoading}
          slotProps={{ paper: { placement: 'bottom-start' } }}
          onChange={(event, newValue) => {
            setFormData({ ...formData, usuario: newValue });
            if (newValue) setFieldErrors((prev) => ({ ...prev, usuario: undefined }));
          }}
          onInputChange={(event, newInputValue) => {
            setUsuarioSearchTerm(newInputValue);
          }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Nenhum usuário encontrado"
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                formData.tipoEscala === 'AVALIADOR'
                  ? 'Avaliador *'
                  : formData.tipoEscala === 'PAUTISTA'
                  ? 'Pautista *'
                  : 'Agente de Apoio *'
              }
              variant="outlined"
              fullWidth
              placeholder="Selecione ou digite para filtrar..."
              error={!!fieldErrors.usuario}
              helperText={fieldErrors.usuario}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {usuarioLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}

      {/* Unidade Origem */}
      <Autocomplete
        options={unidadeOrigemOptions}
        getOptionLabel={(option) => `${option.nome}${option.sigla ? ` (${option.sigla})` : ''}`}
        value={formData.unidadeOrigem}
        loading={unidadeOrigemLoading}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, unidadeOrigem: newValue });
          if (newValue) setFieldErrors((prev) => ({ ...prev, unidadeOrigem: undefined }));
        }}
        onInputChange={(event, newInputValue) => {
          setUnidadeOrigemSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          unidadeOrigemSearchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhuma unidade encontrada'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Unidade Origem *"
            variant="outlined"
            fullWidth
            placeholder="Digite para buscar unidade PFPA..."
            error={!!fieldErrors.unidadeOrigem}
            helperText={fieldErrors.unidadeOrigem}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {unidadeOrigemLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Setor Origem */}
      <Autocomplete
        options={setorOrigemOptions}
        getOptionLabel={(option) => option.nome || ''}
        value={formData.setorOrigem}
        loading={setorOrigemLoading}
        disabled={!formData.unidadeOrigem}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, setorOrigem: newValue });
          if (newValue) setFieldErrors((prev) => ({ ...prev, setorOrigem: undefined }));
        }}
        onInputChange={(event, newInputValue) => {
          setSetorOrigemSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          !formData.unidadeOrigem
            ? 'Selecione uma unidade primeiro'
            : setorOrigemSearchTerm.length < 2
            ? 'Digite pelo menos 2 caracteres'
            : 'Nenhum setor encontrado'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Setor Origem *"
            variant="outlined"
            fullWidth
            placeholder={!formData.unidadeOrigem ? 'Selecione uma unidade primeiro' : 'Digite para buscar...'}
            error={!!fieldErrors.setorOrigem}
            helperText={fieldErrors.setorOrigem}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {setorOrigemLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Unidade Destino */}
      <Autocomplete
        options={unidadeDestinoOptions}
        getOptionLabel={(option) => `${option.nome}${option.sigla ? ` (${option.sigla})` : ''}`}
        value={formData.unidadeDestino}
        loading={unidadeDestinoLoading}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, unidadeDestino: newValue });
          if (newValue) setFieldErrors((prev) => ({ ...prev, unidadeDestino: undefined }));
        }}
        onInputChange={(event, newInputValue) => {
          setUnidadeDestinoSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          unidadeDestinoSearchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhuma unidade encontrada'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Unidade Destino *"
            variant="outlined"
            fullWidth
            placeholder="Digite para buscar unidade destino..."
            error={!!fieldErrors.unidadeDestino}
            helperText={fieldErrors.unidadeDestino}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {unidadeDestinoLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Setor Destino */}
      <Autocomplete
        options={setorDestinoOptions}
        getOptionLabel={(option) => option.nome || ''}
        value={formData.setorDestino}
        loading={setorDestinoLoading}
        disabled={!formData.unidadeDestino}
        slotProps={{ paper: { placement: 'bottom-start' } }}
        onChange={(event, newValue) => {
          setFormData({ ...formData, setorDestino: newValue });
          if (newValue) setFieldErrors((prev) => ({ ...prev, setorDestino: undefined }));
        }}
        onInputChange={(event, newInputValue) => {
          setSetorDestinoSearchTerm(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={
          !formData.unidadeDestino
            ? 'Selecione uma unidade destino primeiro'
            : setorDestinoSearchTerm.length < 2
            ? 'Digite pelo menos 2 caracteres'
            : 'Nenhum setor encontrado'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Setor Destino *"
            variant="outlined"
            fullWidth
            placeholder={!formData.unidadeDestino ? 'Selecione uma unidade destino primeiro' : 'Digite para buscar...'}
            error={!!fieldErrors.setorDestino}
            helperText={fieldErrors.setorDestino}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {setorDestinoLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Botão Iniciar Escala Manual */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Fab
          color="primary"
          variant="extended"
          type="submit"
          disabled={submitting}
          sx={{ px: 4 }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
          ) : (
            <IconPlayerPlay size={20} style={{ marginRight: 8 }} />
          )}
          {submitting ? 'Processando...' : 'Iniciar Escala Manual'}
        </Fab>
      </Box>

      {/* Dialog de feedback */}
      <Dialog
        open={dialog.open}
        onClose={dialog.loading ? undefined : handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {dialog.loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" color="textSecondary">
                {dialog.message}
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  bgcolor: dialog.success ? 'success.light' : 'error.light',
                }}
              >
                {dialog.success ? (
                  <IconCheck size={40} color="#2e7d32" />
                ) : (
                  <IconX size={40} color="#d32f2f" />
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {dialog.success ? 'Sucesso!' : 'Erro'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {dialog.message}
              </Typography>
            </>
          )}
        </DialogContent>
        {!dialog.loading && (
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              color={dialog.success ? 'primary' : 'error'}
              onClick={handleCloseDialog}
              sx={{ px: 4 }}
            >
              Fechar
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default EscalaManualForm;
