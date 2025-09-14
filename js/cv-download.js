document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("download-cv");

  if (btn) {
    btn.addEventListener("click", () => {
      // Agrega el blur al body
      document.body.classList.add("blur-background");

      Swal.fire({
        title: "Choose CV Language",
        icon: "info",
        background: "#1f2937", // gris oscuro
        color: "#f1f5f9", // texto claro
        confirmButtonColor: "#3b82f6", // azul

        showCancelButton: true,
        confirmButtonText: `
          <svg xmlns="http://www.w3.org/2000/svg" class="inline w-5 h-5 mr-2" viewBox="0 0 640 480">
            <path fill="#aa151b" d="M0 0h640v160H0zm0 320h640v160H0z"/>
            <path fill="#f1bf00" d="M0 160h640v160H0z"/>
          </svg>
          Spanish
        `,
        cancelButtonText: `
          <svg xmlns="http://www.w3.org/2000/svg" class="inline w-5 h-5 mr-2" viewBox="0 0 640 480">
            <path fill="#012169" d="M0 0h640v480H0z"/>
            <path fill="#fff" d="M75 0l260 195L595 0h45v60L390 240l250 180v60h-45L335 285 45 480H0v-60l250-180L0 60V0z"/>
            <path fill="#c8102e" d="M430 240l210 150v30L375 240h55zM250 240L0 390v30l210-150h40zM640 60V30L370 210h55L640 60zM0 30v30l210 150h40L0 30z"/>
            <path fill="#fff" d="M240 0h160v480H240zM0 160h640v160H0z"/>
            <path fill="#c8102e" d="M270 0h100v480H270zM0 190h640v100H0z"/>
          </svg>
          English
        `,
        reverseButtons: true,
        customClass: {
          confirmButton: "swal2-confirm",
          cancelButton: "swal2-cancel",
        },
        willClose: () => {
          // Elimina el blur cuando el modal se cierra
          document.body.classList.remove("blur-background");
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.open("public/CV_Lucas_Chacon_esp.pdf", "_blank");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.open("public/CV_Lucas_Chacon_eng.pdf", "_blank");
        }
      });
    });
  }
});
