export type datosExcel = {
  Rp: number;
  Lactancia: number;
  Parto: string;
  Fecha: number;
  Tacto: string | null;
  Leche: number;
  Rcs: number;
};

export type datosPrin = {
  rp: number;
  lactancia: number;
  parto: string;
  del: number;
  tacto: string | null;
  tambo: number;
};

export type datosSec = {
  leche: number | null;
  rcs: number | null;
  totalCs: number | null;
  tanque: number;
  score: number | null;
  fecha: string;
  idVaca: number;
};

export type datosTambo = {
  id: number;
  nombre: string;
};