sap.ui.define([
  "sap/ui/core/Fragment",
  "sap/m/MessageBox"
], function (Fragment, MessageBox) {
  "use strict";

  function _createUploadController(controller) {
    var oUploadDialog;

    /**
     * 
     */
    function closeDialog() {
      oUploadDialog.close();
    }

    function showError(message) {
      MessageBox.error(message || "Upload failed");
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
      }

    };

  }

  return {
    upload: function () {
      Fragment.load({
        id: "uploadDialog",
        name: "apm.fileuploader.ext.fragments.popup.UploadDialog",
        controller: _createUploadController(this)
      }).then(function (oDialog) {
        oDialog.open();
      });
    }
  };
});