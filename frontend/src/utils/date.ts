import { formatDistanceToNow as f } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDistanceToNow = (dateIso: string): string =>
  f(new Date(dateIso), { addSuffix: true, locale: fr });

