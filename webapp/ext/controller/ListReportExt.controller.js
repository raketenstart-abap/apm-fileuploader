sap.ui.define([
  "sap/ui/core/Fragment",
  "sap/ui/unified/FileUploaderParameter",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Fragment, FileUploaderParameter, MessageBox, MessageToast) {
  "use strict";

  function _createUploadController(controller) {
    var oUploadDialog;

    function setDialogBusy(state) {
      oUploadDialog.setBusy(state);
    }

    function closeDialog() {
      oUploadDialog.close();
    }

    function showError(message) {
      MessageBox.error(message || "Upload failed");
    }

    function byId(id) {
      return Fragment.byId("uploadFileDialog", id);
    }

    return {
      onBeforeOpen: function (oEvent) {
        const view = controller.getView();
        oUploadDialog = oEvent.getSource();
        view.addDependent(oUploadDialog);
      },

      onAfterClose: function () {
        const view = controller.getView();
        view.removeDependent(oUploadDialog);
        oUploadDialog.destroy();
        oUploadDialog = undefined;
      },

      onImport: function () {
        setDialogBusy(true);

        const fileUploader = byId("uploadFileDialog_uploader");
        const csrfToken = controller.getView().getModel().getSecurityToken();

        var headerParma = new FileUploaderParameter();
        headerParma.setName("x-csrf-token");
        headerParma.setValue(csrfToken);
        fileUploader.addHeaderParameter(headerParma);

        var headerParma2 = new FileUploaderParameter();
        headerParma2.setName("slug");
        headerParma2.setValue(fileUploader.getValue());
        fileUploader.addHeaderParameter(headerParma2);

        fileUploader.upload();
        fileUploader.destroyHeaderParameters();

        // fileUploader
        //   .checkFileReadable()
        //   .then(function () {
        //     fileUploader.upload();
        //   })
        //   .catch(function () {
        //     showError("The file cannot be read.");
        //     setDialogBusy(false);
        //   });
      },

      onCancel: function () {
        closeDialog();
      },

      onTypeMismatch: function (oEvent) {
        const supportedTypes = oEvent
          .getSource()
          .getFileType()
          .map(function (fileType) {
            return "*." + fileType;
          })
          .join(", ");

        showError(
          "The file type *."
          + oEvent.getParameter("fileType")
          + " is not supported. Choone one of the following types: "
          + supportedTypes
        );
      },

      onUploadComplete: function (oEvent) {
        const status = oEvent.getParameter("status");
        const fileUploader = oEvent.getSource();

        fileUploader.clear();
        setDialogBusy(false);

        switch (status) {
          case 415:
            showError(oEvent.getParameter("response"));
            break;

          default:
            if (status >= 400) {
              const responseRaw = JSON.parse(oEvent.getParameter("responseRaw"));
              showError(responseRaw && responseRaw.error && responseRaw.error.message);
            } else {
              MessageToast.show("Upload successfully");
              controller.extensionAPI.refreshTable();
              closeDialog();
            }
        }
      }
    };

  }

  return {
    upload: function () {
      Fragment.load({
        id: "uploadFileDialog",
        name: "apm.fileuploader.ext.fragments.popup.UploadDialog",
        controller: _createUploadController(this)
      }).then(function (oDialog) {
        oDialog.open();
      });
    }
  };
});
