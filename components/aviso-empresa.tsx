"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ecomundi_aviso_empresa_visto";

export function AvisoEmpresa() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function fechar() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) fechar(); }}>
      <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="bg-white border-b px-6 pt-4 pb-2 flex flex-col items-center">
          <DialogTitle className="sr-only">Bem-vindo à ECO MUNDI</DialogTitle>
          <Image src="/logo.png" alt="ECO MUNDI Consultoria e Gestão" width={220} height={70} priority />
        </div>

        {/* Body */}
        <div className="px-6 pt-3 pb-5 space-y-4">
          <p className="text-sm text-foreground/80 leading-relaxed text-justify">
            Somos especializados em{" "}
            <strong className="text-foreground">licenciamento</strong>,{" "}
            <strong className="text-foreground">compliance ambiental</strong> e{" "}
            <strong className="text-foreground">gestão empresarial</strong>, com
            escritórios em <strong className="text-foreground">Curitiba – PR</strong> e{" "}
            <strong className="text-foreground">Brasília – DF</strong>.
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              Não realizamos coleta de resíduos.
            </li>
            <li className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              Não operamos nem gerenciamos aterros sanitários.
            </li>
          </ul>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 flex gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900/80 leading-relaxed text-justify">
              <span className="font-semibold text-blue-900">Importante</span>
              <br />
              Se você procurava a{" "}
              <strong>Ecomundi Ambiental do Rio de Janeiro</strong>, este não é o
              site dessa empresa. Somos empresas distintas e independentes, sem
              qualquer vínculo entre si.
            </div>
          </div>

          <Button onClick={fechar} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
            Entendi, estou no lugar certo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
