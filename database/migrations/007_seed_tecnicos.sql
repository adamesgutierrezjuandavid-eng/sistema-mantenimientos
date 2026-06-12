INSERT INTO usuarios (nombre, usuario, password_hash, rol)
VALUES
  (
    'Tecnico Juan',
    'tecnico_juan',
    '3ba0293b312318abe6a89cd407d24f5e:848d4571a47881796f308c4d27831e61678bf408504ce676c9270e55eb1812df4b81704ca955ab92ef31ae0b3c67696341e6ed57e73d26bce62980a3eb010fee',
    'tecnico'
  ),
  (
    'Tecnico Maria',
    'tecnico_maria',
    '3ba0293b312318abe6a89cd407d24f5e:848d4571a47881796f308c4d27831e61678bf408504ce676c9270e55eb1812df4b81704ca955ab92ef31ae0b3c67696341e6ed57e73d26bce62980a3eb010fee',
    'tecnico'
  ),
  (
    'Tecnico Pedro',
    'tecnico_pedro',
    '3ba0293b312318abe6a89cd407d24f5e:848d4571a47881796f308c4d27831e61678bf408504ce676c9270e55eb1812df4b81704ca955ab92ef31ae0b3c67696341e6ed57e73d26bce62980a3eb010fee',
    'tecnico'
  ),
  (
    'Tecnico Ana',
    'tecnico_ana',
    '3ba0293b312318abe6a89cd407d24f5e:848d4571a47881796f308c4d27831e61678bf408504ce676c9270e55eb1812df4b81704ca955ab92ef31ae0b3c67696341e6ed57e73d26bce62980a3eb010fee',
    'tecnico'
  )
ON CONFLICT (usuario) DO NOTHING;
