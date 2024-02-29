function list(id,status){
    $.ajax({
        url:`/admin/blockproduct/${id}/${status}`,
        method:'get',
        success:function response(response){
            window.location.reload()
            alert(response.message)
        },
        error : function(err){
            alert("something error detected")
        }
    })
}